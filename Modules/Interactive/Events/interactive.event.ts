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
  "אני לא דרמה קווין, אני הדרמה עצמה",
  "אין דבר כזה יותר מדי נצנצים",
  "אני באתי לצעוק ולנצח – ולבשתי עקבים לשניהם",
  "אם את לא יכולה לאכול פיצה ולרקוד בבגדי פייטים, מה הטעם בחיים?",
  "אני לא אובר–הטופ, אני פשוט מעל הטופ",

  "אני לא אובד, אני פשוט עושה סיבוב קווירי",
  "אם נולדתי לזה, כנראה שנולדתי לנצוץ",
  "לא בחרתי להיות הומו, בחרתי להיות איקוני",
  "אני לא דרמטי, אני פשוט מופע בברודווי",
  "כשהחיים נותנים לי לימונים – אני עושה מהם לוק בגוון צהוב נועז",

  "הלכתי למכולת – חזרתי עם אקס חדש",
  "הכוח הגיי שלי גורם לאינטרנט לעבוד מהר יותר",
  "אני לא צריך אהבה – יש לי פופ, נצנצים וחולצה בלי שרוולים",
  "השמש זורחת כדי שאני אזרח בה",
  "כל יום הוא מצעד גאווה, אם אתה מספיק אמיץ",

  "אני לובש שחור כדי שהקשת תבלוט יותר",
  "מי צריך נסיך כשאני מלכה?",
  "גם הספה יודעת שאני שוכב רק בסטייל",
  "הטרנד שלי זה לא להיות טרנדי",
  "אם אני לא עושה כניסה – אני לא מגיע בכלל",

  "אני לא ביישן, אני רק אייקון בהמתנה",
  "אם הייתי מטאטא – הייתי ממריא",
  "אני גיי כמו שישי בבוקר בשוק הכרמל",
  "מנסה להיות צנוע, אבל הארון כבר התרסק מזמן",
  "אני קווירי, אני מהמם, ואני תמיד מגיע באיחור אופנתי"
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
