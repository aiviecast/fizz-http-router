# fizz-http-router

Fizz の **HTTP 振り分けコア**(§7 Hub)。`(method, path)` を、それを処理するハンドラ
(route id)に対応付ける。順序付き method+prefix マッチで、より具体的な
`/api/tts/voicevox` を `/api/tts` より先に判定する。各ハンドラ呼び出しは Node の I/O
だが、振り分け表は純粋なので Almide に集約=単一の正本。移植元: openaituber
`server.ts` のエンドポイント分岐。

route id: `0 health / 1 probe / 2 convert / 3 chat / 4 tts_voicevox / 5 tts / 6 memory / 7 settings / 8 x / -1 not-found`

## native

```sh
almide build src/main.almd -o build/fizz-http-router
printf 'POST /api/tts/voicevox\nGET /api/health\n' | ./build/fizz-http-router
# POST /api/tts/voicevox	tts_voicevox
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/router.wasm
```

`route_alloc(len)` で "METHOD path" を線形メモリに書く → `route() -> Float`(route id、
-1=未対応)。グルー例 [`browser/router-driver.js`](./browser/router-driver.js)。CI で
wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
