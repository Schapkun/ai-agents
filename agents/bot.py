import os
from collections import defaultdict
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from anthropic import Anthropic
from prompts import AGENT_PROMPTS, AGENT_INFO

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Actieve agent per gebruiker
user_agents: dict[int, str] = {}

# Gespreksgeschiedenis per gebruiker per agent
# Structuur: { user_id: { agent_id: [ {"role": "user"|"assistant", "content": "..."} ] } }
user_history: dict[int, dict[str, list]] = defaultdict(lambda: defaultdict(list))

MAX_HISTORY = 20  # Maximaal aantal berichten in geheugen (per agent)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Hoi! Ik ben je AI Agents bot.\n\n"
        "Kies een agent:\n"
        "/assistent — Algemene vragen & coördinatie\n"
        "/research — Onderzoek & samenvattingen\n"
        "/code — Web development hulp\n\n"
        "Kies een agent en stuur dan je bericht."
    )


async def set_agent(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    command = update.message.text.strip("/")

    if command in AGENT_PROMPTS:
        user_agents[user_id] = command
        info = AGENT_INFO[command]
        await update.message.reply_text(
            f"{info['naam']} is actief. {info['beschrijving']}.\n"
            f"Stuur je bericht."
        )


async def wis(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Wis de gespreksgeschiedenis voor de actieve agent."""
    user_id = update.effective_user.id
    if user_id in user_agents:
        agent = user_agents[user_id]
        user_history[user_id][agent] = []
        await update.message.reply_text("Gesprek gewist. We beginnen opnieuw.")
    else:
        await update.message.reply_text("Kies eerst een agent: /assistent /research /code")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    user_text = update.message.text

    if user_id not in user_agents:
        await update.message.reply_text(
            "Kies eerst een agent:\n/assistent /research /code"
        )
        return

    agent = user_agents[user_id]
    system_prompt = AGENT_PROMPTS[agent]

    # Voeg user bericht toe aan geschiedenis
    history = user_history[user_id][agent]
    history.append({"role": "user", "content": user_text})

    # Beperk geschiedenis tot laatste MAX_HISTORY berichten
    if len(history) > MAX_HISTORY:
        history = history[-MAX_HISTORY:]
        user_history[user_id][agent] = history

    await update.message.chat.send_action("typing")

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=system_prompt,
            messages=history,
        )

        antwoord = response.content[0].text

        # Voeg assistant antwoord toe aan geschiedenis
        history.append({"role": "assistant", "content": antwoord})

        # Beperk opnieuw na toevoeging
        if len(history) > MAX_HISTORY:
            user_history[user_id][agent] = history[-MAX_HISTORY:]

    except Exception as e:
        antwoord = f"Er ging iets mis: {str(e)}"
        # Verwijder het laatste user bericht als de API call faalt
        if history and history[-1]["role"] == "user":
            history.pop()

    # Telegram heeft een limiet van 4096 tekens per bericht
    if len(antwoord) > 4000:
        for i in range(0, len(antwoord), 4000):
            await update.message.reply_text(antwoord[i:i + 4000])
    else:
        await update.message.reply_text(antwoord)


def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    app = Application.builder().token(token).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("assistent", set_agent))
    app.add_handler(CommandHandler("research", set_agent))
    app.add_handler(CommandHandler("code", set_agent))
    app.add_handler(CommandHandler("wis", wis))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Bot is gestart!")
    app.run_polling()


if __name__ == "__main__":
    main()
