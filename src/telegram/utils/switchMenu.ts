import { bot } from "../../constant.js";

const switchMenu = async (chatId: number, messageId: number | undefined, title: string, json_buttons: any) => {
  const keyboard = {
    inline_keyboard: json_buttons,
    resize_keyboard: true,
    one_time_keyboard: true,
    force_reply: true
  };

  try {
    await bot.editMessageText(
      title, 
      { 
        chat_id: chatId, 
        message_id: messageId, 
        reply_markup: keyboard, 
        disable_web_page_preview: true, 
        parse_mode: 'HTML' 
      }
    )
  } catch (error) {
    console.log(`${chatId}, switch menu error: ${error}`);
  }
}

export default switchMenu;