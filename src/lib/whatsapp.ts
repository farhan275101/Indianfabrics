import { formatINR } from './store';
import { BagItem } from './types';

export const FACTORY_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

export function buildWholesaleWhatsAppUrl(
  items: BagItem[],
  buyerInfo?: {
    business_name?: string;
    buyer_name?: string;
    city_state?: string;
    order_code?: string;
  }
): string {
  let totalPcs = 0;
  let totalAmount = 0;

  let text = `Namaste VastraVani Looms!%0A*B2B WHOLESALE ORDER INQUIRY*%0A`;

  if (buyerInfo?.order_code) {
    text += `Order ID: *${buyerInfo.order_code}*%0A`;
  }
  if (buyerInfo?.business_name) {
    text += `Shop/Boutique: *${buyerInfo.business_name}* (${buyerInfo.buyer_name || ''}, ${buyerInfo.city_state || ''})%0A`;
  }

  text += `%0A*Selected Designs:*%0A`;

  items.forEach((item, idx) => {
    const pcs = item.sets * item.moq;
    const sub = pcs * item.wholesale_price;
    totalPcs += pcs;
    totalAmount += sub;
    text += `${idx + 1}. *${item.name}* (${item.sku})%0A   Pack: ${item.pack_option} | ${item.sets} Set (${pcs} Pcs) × ${formatINR(item.wholesale_price)} = ${formatINR(sub)}%0A`;
  });

  text += `%0A*Total Pieces:* ${totalPcs} Pcs%0A*Estimated Factory Total:* ${formatINR(totalAmount)} (Ex-Factory)`;

  return `https://wa.me/${FACTORY_WHATSAPP}?text=${text}`;
}
