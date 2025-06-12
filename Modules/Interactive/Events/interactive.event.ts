import { Client, ClientEvents, Message } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";

const funnyComeBacks = [
  "דקה אני משחיל את אמא של מטרנה השבורה מהתחת הזאת",
  "Oy vey!!",
  "מה אתה רוצה באמא שלך",
  "עוד מפתחים אותי, שחרר",
  "רגע אמא של מטרנה שותה לי מהאסלה",
  "ליצן בכלל"
];

const gayFunnySentencesHebrew: string[] = [
  "אני לא דרמה קווין, אני הדרמה עצמה uwu~",
  "אין דבר כזה יותר מדי נצנצים, זה פשוט האופי שלי ✨",
  "באתי לצרוח בקול גבוה ולנצח עם גרביים מעל הברך 💖",
  "אם אי אפשר לרקוד בפייטים ולשתות בועות ורודות – אני לא משתתף 🍓",
  "אני לא מעל הטופ, אני קופץ עליו עם קוקיות 🎀",

  "לא אובד, פשוט עושה twirl קווירי בשכונה 💅",
  "נולדתי לנצוץ כמו נעלי פלטפורמה ביום שמש 🌈",
  "לא בחרתי להיות הומו, בחרתי להיות מהמם בשורטס ✨",
  "אני לא דרמטי, אני מחזמר עם קשת בשיער 😳",
  "קיבלתי לימונים? עשיתי מהם ג’ל נצנצים ומוד בויזואליה 🍋💫",

  "באתי לקנות חלב, חזרתי עם דייט וחולצת קרופ 💕",
  "הכוח הגיי שלי? משגר Wi-Fi וממסמס בחיוך ✨📱",
  "אהבה זה אוברייטד, יש לי פופ יפני וגופיית רשת uwu",
  "השמש לא זורחת – היא פשוט מתביישת ממני 😳☀️",
  "כל יום הוא מצעד, ואני הכוכבת המאחרת 🌟",

  "לובש שחור כי הקשת שלי צריכה קונטרסט 🎀",
  "נסיך? אני הבייבי-מלכה עם לק ורוד 💅👑",
  "גם הספה יודעת שאני שוכב רק בפוזה אנימה uwu~",
  "הטרנד שלי זה גרביונים עם פסים וקצת גלאם 💖",
  "אם אין כניסה עם מוזיקת פתיחה – אל תצפו שאגיע 😌",

  "לא ביישן – סתם עושה פוזה לפני הסצנה ✨",
  "אם הייתי מטאטא – כבר הייתי באוויר עם חיוך 🍃",
  "אני גיי כמו בועות בשוק הכרמל ביום שישי 🎈",
  "צניעות? הארון התרסק מהאובר-סטייל שלי 💅",
  "אני קווירי, מהמם, ותמיד בא באיחור עם צליל סיילור מון 🌙💫"
];

let index = 0;

class InteractiveEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (message.mentions.members?.has(client.user.id)) {
      message.channel.send(gayFunnySentencesHebrew[++index % gayFunnySentencesHebrew.length]);
    }
  }
}

export const interactiveEvent = new InteractiveEvent();
