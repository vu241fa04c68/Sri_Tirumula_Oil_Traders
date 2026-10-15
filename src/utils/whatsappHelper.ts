import { Linking, Platform } from 'react-native';
import { Order } from '../types';
import { SHOP_METADATA } from '../constants/theme';

export const sendOrderToWhatsApp = (order: Order, adminPhone: string = SHOP_METADATA.phone) => {
  const cleanPhone = adminPhone.trim().replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  let itemsListText = '';
  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    itemsListText += `${index + 1}. *${item.nameEn}* (${item.unit}) x ${item.quantity} = ₹${itemTotal}\n`;
  });

  const paymentText = order.paymentMethod === 'PICKUP' ? 'Pay & Pick Up at Store' : 'Cash on Delivery (COD)';

  const message = `🛒 *NEW ORDER RECEIVED - SRI TIRUMALA OIL TRADERS*

📋 *Order ID:* #${order.id.slice(-6).toUpperCase()}
👤 *Customer Name:* ${order.customerName}
📞 *Customer Mobile:* ${order.customerPhone}

📍 *Delivery Address:*
${order.address.fullAddress}${order.address.city ? `, ${order.address.city}` : ''}${order.address.pincode ? ` - ${order.address.pincode}` : ''}

📦 *ORDER ITEMS:*
${itemsListText}
--------------------------------
💵 *Subtotal:* ₹${order.subtotal}
🚚 *Delivery Fee:* ₹${order.deliveryCharge === 0 ? 'FREE' : order.deliveryCharge}
💰 *TOTAL AMOUNT:* ₹${order.total}
💳 *Payment Method:* ${paymentText}
--------------------------------
Please confirm this order and prepare for delivery.`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank');
      }
    } else {
      Linking.canOpenURL(waUrl).then(supported => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Linking.openURL(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMsg}`);
        }
      });
    }
  } catch (e) {
    console.warn('Could not launch WhatsApp URL:', e);
  }
};
