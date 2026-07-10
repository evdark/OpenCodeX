const isPlus = () => process.env.OPENCODEX === "1" || process.env.OPENCODE_PLUS === "1"

const logoDefault = {
  left: ["                   ", "█▀▀█ █▀▀█ █▀▀█ █▀▀▄", "█__█ █__█ █^^^ █__█", "▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀~~▀"],
  right: ["             ▄     ", "█▀▀▀ █▀▀█ █▀▀█ █▀▀█", "█___ █__█ █__█ █^^^", "▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀"],
}

// Compact O+X block for OpenCodeX CLI vibe (kaomoji-friendly wordmark space).
const logoPlus = {
  left: ["                   ", "█▀▀█ █▀▀█ █▀▀█ █▀▀▄", "█__█ █__█ █^^^ █__█", "▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀~~▀"],
  right: ["             ▄     ", "█▀▀█ ▄█▄ █▀▀█ █▀▀█", "█__█  █  █__█ █^^^", "▀▀▀▀ ▀▀▀ ▀▀▀▀ ▀▀▀▀"],
}

export const logo = new Proxy(logoDefault, {
  get(_target, prop: string | symbol) {
    const source = isPlus() ? logoPlus : logoDefault
    if (prop === "left" || prop === "right") return source[prop]
    return Reflect.get(source, prop)
  },
})

export const go = {
  left: ["    ", "█▀▀▀", "█_^█", "▀▀▀▀"],
  right: ["    ", "█▀▀█", "█__█", "▀▀▀▀"],
}

export const marks = "_^~,"

export const kaomoji = {
  ready: ["(⌐■_■)", "(•̀ᴗ•́)و", "ヽ(•‿•)ノ", "(ง'̀-'́)ง"],
  think: ["(・・ )?", "(¬_¬)", "(・_・;)"],
  done: ["(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "✓ (ᵔᴥᵔ)", "✧٩(ˊᗜˋ*)و✧"],
  pick: () => {
    const list = kaomoji.ready
    return list[Math.floor(Math.random() * list.length)]!
  },
}
