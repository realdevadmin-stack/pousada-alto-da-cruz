# Site Pousada Alto da Cruz

Site público estático pronto para Cloudflare Pages.

## Cloudflare

- Root directory: `/`
- Build command: `npm run build`

## Arquivos

- `index.html`
- `admin.html`
- `styles.css`
- `script.js`
- `admin.js`
- `firebase.js`
- `config.js`
- `favicon.png`
- `assets/images/`


## Correções aplicadas

- Corrigido erro de Firebase vazio: o app não tenta iniciar Firebase sem `config.js` preenchido.
- Corrigido botão do WhatsApp para enviar mensagens para a pousada: `5571985610497`.
- Corrigidos emojis e textos quebrados por encoding.
- Corrigido calendário do painel admin (`row.children[dayIndex]`).
- Corrigido bloco CSS quebrado do cabeçalho do calendário.
- Removido link `Admin` do menu público.

## Ativar Firebase

Preencha `config.js` com os dados reais do Firebase Console:

```js
export const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID",
};
```

No Firebase, habilite Authentication com Email/Password e adicione os domínios autorizados:

- localhost
- pousadaaltodacruz.online
- www.pousadaaltodacruz.online
