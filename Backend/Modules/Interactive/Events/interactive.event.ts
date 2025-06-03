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

let index = 0;

class InteractiveEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (message.mentions.members?.has(client.user.id)) {
      message.channel.send(funnyComeBacks[++index % funnyComeBacks.length]);
    }
  }
}

export const interactiveEvent = new InteractiveEvent();
