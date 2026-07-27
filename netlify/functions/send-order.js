// Bu funksiya yangi buyurtma haqidagi ma'lumotni Telegram botga xabar sifatida yuboradi.
// Bot tokeni va chat ID faqat shu serverda saqlanadi, brauzerga chiqmaydi.

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan." }),
    };
  }

  let order;
  try {
    order = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Noto'g'ri so'rov formati" }) };
  }

  if (!order.phone || !Array.isArray(order.items) || order.items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Buyurtma ma'lumotlari to'liq emas" }) };
  }

  const itemsText = order.items
    .map((it) => `• ${it.name} (${it.brand}) — ${it.qty} dona — ${Number(it.price).toLocaleString("uz-UZ")} so'm`)
    .join("\n");

  const message =
    `🛍 *Yangi buyurtma!*\n\n` +
    `${itemsText}\n\n` +
    `💰 *Jami:* ${Number(order.total).toLocaleString("uz-UZ")} so'm\n` +
    `📞 *Telefon:* ${order.phone}\n` +
    (order.address ? `📍 *Manzil:* ${order.address}\n` : "") +
    `🕒 ${new Date(order.createdAt || Date.now()).toLocaleString("uz-UZ")}`;

  try {
    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Telegram xabar yuborishda xatolik", details: tgData }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Telegram API'ga ulanishda xatolik" }),
    };
  }
}
