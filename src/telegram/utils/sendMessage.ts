import { bot } from "../../constant.js";

const sendMessage = (chatId: number, message: string) => {
  try {
    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.log(`${chatId}, send message error: ${error}`);
  }
}

export default sendMessage;