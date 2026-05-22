import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import products from '@/data/products.json';
import { calculateShipping } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

const MAX_CART_LINES = 25;
const MAX_QTY_PER_LINE = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(req: Request) {
  const key = getClientIp(req);
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) return false;
  current.count += 1;
  return true;
}

function asCleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.keshvicrafts.in';
  if (process.env.PAYU_ENV === 'secure' && /localhost|127\.0\.0\.1/i.test(baseUrl)) {
    throw new Error('Production PayU cannot use a localhost NEXT_PUBLIC_BASE_URL');
  }
  return baseUrl.replace(/\/$/, '');
}

function validateCheckoutPayload(body: any) {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');

  const formData = body.formData || {};
  const cleanForm = {
    fullName: asCleanString(formData.fullName, 120),
    phoneNumber: asCleanString(formData.phoneNumber, 20),
    email: asCleanString(formData.email, 160).toLowerCase(),
    address: asCleanString(formData.address, 300),
    city: asCleanString(formData.city, 80),
    pincode: asCleanString(formData.pincode, 12),
    orderNote: asCleanString(formData.orderNote, 500),
  };

  if (!cleanForm.fullName) throw new Error('Full name is required');
  if (!/^[6-9]\d{9}$/.test(cleanForm.phoneNumber.replace(/\D/g, ''))) {
    throw new Error('Valid Indian phone number is required');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanForm.email)) {
    throw new Error('Valid email is required');
  }
  if (!cleanForm.address || !cleanForm.city) throw new Error('Address and city are required');
  if (!/^\d{6}$/.test(cleanForm.pincode)) throw new Error('Valid PIN code is required');

  if (!Array.isArray(body.cart) || body.cart.length === 0 || body.cart.length > MAX_CART_LINES) {
    throw new Error('Invalid cart');
  }

  return { formData: cleanForm, cart: body.cart };
}

export async function POST(req: Request) {
  try {
    if (!checkRateLimit(req)) {
      return NextResponse.json({ success: false, error: 'Too many checkout attempts' }, { status: 429 });
    }

    const body = await req.json();
    const { formData, cart } = validateCheckoutPayload(body);

    // 1. Generate a unique merchant transaction ID
    const merchantTransactionId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    // 2. Server-side price recalculation
    let total = 0;
    let discountableSubtotal = 0;
    
    // Enrich items securely from server data
    const enrichedItems = cart.map((cartItem: any) => {
      const product = products.find((p: any) => p.slug === (cartItem.slug || cartItem.productSlug));
      if (!product) {
        throw new Error(`Product not found: ${cartItem.slug}`);
      }
      const price = product.price;
      const qty = Number(cartItem.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
        throw new Error(`Invalid quantity for product: ${product.slug}`);
      }
      
      const itemTotal = price * qty;
      total += itemTotal;
      
      if (product.type !== "custom-order") {
        discountableSubtotal += itemTotal;
      }
      
      return {
        ...cartItem,
        price,
        shippingCharge: product.shippingCharge,
        qty
      };
    });

    let discountPercent = 0;
    if (discountableSubtotal > 1800) discountPercent = 20;
    else if (discountableSubtotal > 1250) discountPercent = 10;

    const discountAmount = Math.round((discountableSubtotal * discountPercent) / 100);
    const shipping = calculateShipping(enrichedItems, total);
    
    // Computed grand total
    const computedGrandTotal = total - discountAmount + shipping;

    // Convert total to paise (integer) to avoid floating point errors
    const totalAmountPaise = Math.round(computedGrandTotal * 100);

    // 3. Save Order to Database (PENDING status)
    await prisma.order.create({
      data: {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email || null,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        orderNote: formData.orderNote || null,
        totalAmountPaise,
        paymentMethod: 'PAYU',
        status: 'PENDING',
        merchantTransactionId,
        items: {
          create: enrichedItems.map((item: any) => ({
            productId: item.slug || item.productSlug,
            productTitle: item.title,
            quantity: item.qty,
            priceAtPurchasePaise: Math.round(item.price * 100),
          })),
        },
      },
    });

    // 4. Generate PayU Hash
    const key = getRequiredEnv('PAYU_MERCHANT_KEY');
    const salt = getRequiredEnv('PAYU_MERCHANT_SALT');
    const amount = computedGrandTotal.toFixed(2); // PayU expects exact decimal string format for hash like "100.00"
    const productInfo = "Order"; // Simplify productInfo to avoid space-related issues
    const firstName = formData.fullName.split(' ')[0] || 'Customer';
    const email = formData.email || 'customer@example.com';
    const udf = {
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
      udf6: '',
      udf7: '',
      udf8: '',
      udf9: '',
      udf10: '',
    };

    // Hash sequence:
    // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    const hashParts = [
      key, merchantTransactionId, amount, productInfo, firstName, email,
      udf.udf1, udf.udf2, udf.udf3, udf.udf4, udf.udf5,
      udf.udf6, udf.udf7, udf.udf8, udf.udf9, udf.udf10,
      salt
    ];
    const hashString = hashParts.join('|');
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const actionUrl = process.env.PAYU_ENV === 'secure' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';
    
    // Safely resolve the base URL
    const baseUrl = getBaseUrl();

    return NextResponse.json({
      success: true,
      hash,
      txnid: merchantTransactionId,
      amount,
      productInfo,
      firstName,
      email,
      phone: formData.phoneNumber.replace(/\D/g, ''),
      udf,
      key,
      surl: `${baseUrl}/api/payu/response`,
      furl: `${baseUrl}/api/payu/response`,
      actionUrl,
    });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
