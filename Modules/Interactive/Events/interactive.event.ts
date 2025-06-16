import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";

const funnyComeBacks = [
  "Oy vey!!",
  "דקה אני משחיל את אמא של מטרנה השבורה מהתחת הזאת",
  "מה אתה רוצה באמא שלך",
  "עוד מפתחים אותי, שחרר",
  "רגע אמא של מטרנה שותה לי מהאסלה",
  "ליצן בכלל",
  "שחרר יקבב",
  "שמע מה אתה חופר",
  "מי הרשה לך לדבר???",
  "אני לא מחזיר תשובות לטמבלים",
  "סורי אני לא עובד עם נחותים",
  "תעדכן גרסה לאישיות שלך אולי",
  "שמע אתה מוזר, מישהו צריך לומר לך את זה",
  "אני לא מדבר עם NPCs",
  "בדקת חיבור לאינטרנט? אולי תחזור כשיהיה לך קליטה למוח",
  "צא צא לי מהראם",
  "חראם על האחסון יבזבוז חמצן",
  "מי שתייג אותי שמן ומוזר",
  "שחרר אותייייי שחררררררר"
];

let index = 0;

class InteractiveEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (message.mentions.members?.has(client.user.id)) {
      message.channel.send(funnyComeBacks[index++ % funnyComeBacks.length]);
    }
  }
}

export const interactiveEvent = new InteractiveEvent();
