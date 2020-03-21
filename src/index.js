require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const Parser = require('rss-parser')
const parser = new Parser()

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true})

bot.onText(
  /^\/getFeed (.+) (.+)$/i,
  async ({chat: {id: chatId}}, [, url, page = 1]
) => {
  const feed = await parser.parseURL(url)
  const realPage = ~~page
  const pageSize = 2
  const totalPages = Math.ceil(feed.items.length / pageSize)
  const start = 0 + ((realPage - 1) * pageSize)
  const end = pageSize + ((realPage - 1) * pageSize)
  await bot.sendMessage(chatId, `Showing page ${realPage} of ${totalPages}`)
  for (let item of feed.items.slice(start, end)) {
    const url = '`' + item.enclosure.url + '`'
    await bot.sendMessage(
      chatId,
      `/sendAudio chanelID ${url} ${item.title}`,
      {parse_mode: 'Markdown'}
    )
  }
})

bot.onText(
  /^\/sendAudio (.+)$/i,
  async ({chat: {id: chatId}}, [, data]
) => {
  const [channel, url, ...title] = data.split(' ')
  bot.sendAudio(channel, url, {caption: title.join(' ')})
    .catch(error => {
      bot.sendMessage(chatId, error.message + JSON.stringify({url, title: title.join('')}))
    })
})

bot.onText(/^\/getchannelID$/i, async ({chat: {id: chatId}}) => {
  bot.sendMessage(chatId, chatId)
})
