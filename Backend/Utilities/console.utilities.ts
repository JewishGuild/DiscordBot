import chalk from "chalk";
import { GeneralUtilities } from "./general.utilities.js";

export class ConsoleUtilities {
  private defaultTopic: string;
  private defaultSubTopic: string;

  constructor(topic: string, subTopic: string = "") {
    this.defaultTopic = topic;
    this.defaultSubTopic = subTopic;
  }

  public log(msg: string, subTopic = this.defaultSubTopic, topic = this.defaultTopic) {
    console.log(chalk["blueBright"](this.getPrefix(topic, subTopic) + msg));
  }

  public success(msg: string, subTopic = this.defaultSubTopic, topic = this.defaultTopic) {
    console.log(chalk["greenBright"](this.getPrefix(topic, subTopic) + msg));
  }

  public error(msg: string, subTopic = this.defaultSubTopic, topic = this.defaultTopic) {
    console.error(chalk["red"](this.getPrefix(topic, subTopic) + msg));
  }

  public warn(msg: string, subTopic = this.defaultSubTopic, topic = this.defaultTopic) {
    console.error(chalk["yellowBright"](this.getPrefix(topic, subTopic) + msg));
  }

  public boldLog(msg: string, subTopic = this.defaultSubTopic, topic = this.defaultTopic) {
    console.log(chalk.bgMagentaBright(chalk.bold(chalk.green(this.getPrefix(topic, subTopic) + msg + " "))));
  }

  private getPrefix(topic: string, subTopic: string) {
    if (topic) {
      topic = `{${topic}}`;
    }

    return `${GeneralUtilities.getTimeStamp()} | ${topic ? `${topic} ` : ""}${subTopic ? `(${subTopic}) ` : ""}`;
  }
}
