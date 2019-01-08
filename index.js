const Koa = require('koa');
const views = require('koa-views');
const static = require('koa-static');
const bodyparser = require('koa-bodyparser'); // required
const app = new Koa();
let router = require('./router.js');

app.keys = ['quarterly_advance']; // 设置签名的cookie密钥

app.use(views(`${__dirname}/static`));
app.use(static(`${__dirname}/static`));
app.use(bodyparser({
     enableTypes: ['json', 'form', 'text'],
}));

app
    // .use(authorize())
    .use(router.routes())
    .use(router.allowedMethods());

// TODO 日志记录
app.on('error', (err, ctx) => {
    console.log('error message: ', err, ctx);
});

app.listen(9000);
