import { Injectable } from '@nestjs/common';

const GEMINI_API_KEY = '';
const products = [
  { name: 'iPhone 15', price: 69999, stock: 5, delivery: '2 days' },
  { name: 'Samsung TV', price: 45999, stock: 2, delivery: '3 days' },
  { name: 'Nike Shoes', price: 4999, stock: 12, delivery: 'tomorrow' },
];
const orders = [
  { id: 'ORD123', item: 'iPhone 15', status: 'Shipped', delivery: 'July 18' },
  { id: 'ORD456', item: 'Nike Shoes', status: 'Delivered', delivery: 'July 12' },
];
const faqs = [
  { topic: 'return', answer: 'Most items can be returned within 7 days of delivery.' },
  { topic: 'refund', answer: 'Refunds usually take 3 to 5 business days after return pickup.' },
  { topic: 'payment', answer: 'We support card, UPI, net banking, and cash on delivery.' },
];

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async chat(message = '') {
    const prompt = message.trim();
    const text = prompt.toLowerCase();
    const product = products.find((p) => text.includes(p.name.toLowerCase()));
    const order = orders.find((o) => text.includes(o.id.toLowerCase()));
    const faq = faqs.find((f) => text.includes(f.topic));
    const wantsProducts = ['product', 'products', 'list', 'available', 'buy'].some((word) => text.includes(word));
    const wantsOrders = ['order', 'delivery', 'receive', 'shipped', 'delivered'].some((word) => text.includes(word));
    const isShoppingQuestion = wantsProducts || wantsOrders || !!faq;

    const context = [
      product && `Product: ${product.name}, Price: ${product.price}, Stock: ${product.stock}, Delivery: ${product.delivery}`,
      order && `Order: ${order.id}, Item: ${order.item}, Status: ${order.status}, Delivery: ${order.delivery}`,
      faq && `Policy: ${faq.answer}`,
      !product && wantsProducts && `Products:\n${products.map((p) => `- ${p.name}, Price: ${p.price}, Stock: ${p.stock}, Delivery: ${p.delivery}`).join('\n')}`,
      !order && wantsOrders && `Orders:\n${orders.map((o) => `- ${o.id}, Item: ${o.item}, Status: ${o.status}, Delivery: ${o.delivery}`).join('\n')}`,
    ].filter(Boolean).join('\n');

    if (!prompt) return { reply: 'Please type a message.' };
    if (!isShoppingQuestion) return { reply: 'I can help with Amazon shopping questions about products, orders, returns, refunds, and payments.' };
    if (!GEMINI_API_KEY) return { reply: `You said: ${prompt}` };

    const finalPrompt = `You are Alexa, an Amazon shopping assistant. Answer only using this context. If context is not enough, say what detail is needed.\n\nContext:\n${context}\n\nUser: ${prompt}`;
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}&alt=json`;
    let data: any;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
      });
      data = await res.json();
    } catch {
      return { reply: 'Gemini is not reachable right now.' };
    }

    return {
      reply:
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Sorry, I could not answer that.',
    };
  }
}
