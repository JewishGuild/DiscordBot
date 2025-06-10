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

const emoSentencesHebrew: string[] = [
  // About pain and darkness
  "הכאב שלי הוא החבר הכי טוב שלי", // My pain is my best friend
  "אני שוקע בים של דמעות", // I'm drowning in a sea of tears
  "הלב שלי שבור למיליון חלקים", // My heart is broken into a million pieces
  "החושך הוא הבית שלי", // Darkness is my home
  "אני נושם כאב במקום אוויר", // I breathe pain instead of air

  // About loneliness and isolation
  "אני לבד בעולם מלא אנשים", // I'm alone in a world full of people
  "הבדידות שלי צועקת בשקט", // My loneliness screams in silence
  "אף אחד לא מבין את הסבל שלי", // No one understands my suffering
  "אני רוח רפאים בחיים שלי", // I'm a ghost in my own life
  "העולם ממשיך והלב שלי עומד", // The world keeps going and my heart stands still

  // About emptiness and numbness
  "אני ריק מבפנים כמו בית נטוש", // I'm empty inside like an abandoned house
  "החיים שלי הם סרט בשחור לבן", // My life is a black and white movie
  "אני מת מבפנים אבל חי מבחוץ", // I'm dead inside but alive outside
  "הרגשות שלי נמסו כמו שלג", // My feelings melted like snow
  "אני צל של מי שהייתי פעם", // I'm a shadow of who I once was

  // About lost love and heartbreak
  "אהבת אותי עד שהרסת אותי", // You loved me until you destroyed me
  "הזיכרונות שלנו הם סכינים בלב", // Our memories are knives in my heart
  "עזבת אותי עם חתיכות של עצמי", // You left me with pieces of myself
  "האהבה שלנו מתה אבל אני עדיין חי בה", // Our love died but I still live in it
  "הלב שלי קבר לאהבה שמתה", // My heart is a grave for dead love

  // About self-destruction and despair
  "אני הורס את עצמי כדי להרגיש משהו", // I destroy myself to feel something
  "הייאוש הוא השפה היחידה שאני מכיר", // Despair is the only language I know
  "אני טובע באוקיינוס של דמעות שלי", // I'm drowning in an ocean of my own tears
  "הכאב הוא האמת היחידה שאני יודע", // Pain is the only truth I know
  "אני נלחם במלחמה נגד עצמי", // I'm fighting a war against myself

  // About masks and hiding
  "החיוך שלי הוא המסכה הכי טובה שלי", // My smile is my best mask
  "אני שחקן בתיאטרון של החיים", // I'm an actor in the theater of life
  "מסתיר את הסערה מאחורי עיניים שקטות", // Hiding the storm behind quiet eyes
  "אני מתחזה לבריא בעולם חולה", // I pretend to be healthy in a sick world
  "לובש פנים שמחות על לב עצוב", // Wearing a happy face over a sad heart

  // About time and memories
  "הזמן לא מרפא, הוא רק מטשטש", // Time doesn't heal, it just blurs
  "אני חי בעבר שלא יחזור", // I live in a past that won't return
  "כל יום הוא עוד יום להישרד", // Every day is another day to survive
  "הזיכרונות הם כלא שבניתי לעצמי", // Memories are a prison I built for myself
  "אתמול מת, מחר לא נולד, היום אני גוסס", // Yesterday died, tomorrow wasn't born, today I'm dying

  // About society and alienation
  "אני זר בעולם שלא בחרתי", // I'm a stranger in a world I didn't choose
  "החברה דוחה אותי כמו נגיף", // Society rejects me like a virus
  "אני פרח שגדל באספלט", // I'm a flower growing in asphalt
  "העולם יפה מדי בשביל הכאב שלי", // The world is too beautiful for my pain
  "אני שונה, אני שבור, אני חי" // I'm different, I'm broken, I'm alive
];

let index = 0;

class InteractiveEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (message.mentions.members?.has(client.user.id)) {
      message.channel.send(emoSentencesHebrew[++index % emoSentencesHebrew.length]);
    }
  }
}

export const interactiveEvent = new InteractiveEvent();
