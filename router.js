/**
* 路由
*/
const Router = require('koa-router');
let router = new Router();

const redis = require('redis');
let client = redis.createClient({
    host: '127.0.0.1',
    port: '6379',
});

client.on('connect', function() {
    console.log('Redis has connected to the server.');
});

client.on('end', function() {
    console.log('Redis server connection has closed');
});

client.on('error', function(err) {
    console.log(`Redis error: ${err}`);
});

// save data error handle TODO
router.post('/add', async (ctx, next) => {
    let body = ctx.request.body;

    console.log('submit info: ', ctx.request.body);
    client.set("node-redis-add", JSON.stringify(body));

    let list;

    try {
        list = await new Promise((resolve, reject) => {
            client.get('node-redis-list', function(err, result) {
                if (err) {
                    reject(err);
                } 
                resolve(result);
            });
        });
    } catch(e) {
        console.error(e);
    }
    

    let result = [];
    list = list === null? result.push(body): 
        result = [body, ...JSON.parse(list)];

    client.set('node-redis-list', JSON.stringify(result));
    ctx.body = {code: 0, message: 'success'};
});

// get data for list
router.get('/list', async (ctx, next) => {
    let list = await new Promise((resolve, reject) => {
        client
            .get("node-redis-list", function(err, result) {
                if (err) {
                    reject(err);
                }

                console.log('redis list is  ', result);
                resolve(result);
            });
    });

    list = list === null? JSON.stringify([]): list;
    return ctx.body = {
            code: 0,
            message: 'success',
            list: list,
        };
});

// wipe data 
router.post('/wipeData', (ctx, next) => {
    client.set('node-redis-list', JSON.stringify([]));

    return ctx.body = {
        code: 0,
        message: 'success',
    };
});

// export
router.get('/export', async (ctx, next) => {
    let data = await new Promise((resolve, reject) => {
        client
            .get("node-redis-list", function(err, result) {
                if (err) {
                    reject(err);
                }

                console.log('Redis list of export are  ', result);
                resolve(result);
            });
    });

    let list = JSON.parse(data);

    if (list && !list.length) {
        return ctx.body = {
            code: -1,
            message: '目前没有数据！',
        };
    }
    
    const fs = require('fs');
    let writeStream = fs.createWriteStream(`${__dirname}/static/个人报销预提.csv`, 'utf8');

    writeStream.on('close', (err) => {
        console.log('Stream closed');
    });
    writeStream.on('error', (err) => {
        console.error(err);
        console.trace();
    });
    writeStream.on('finish', () => {
        console.log('写入已完成');
    });
    writeStream.cork();
    writeStream.write(`姓名,成本中心,金额（元） \n`, 'utf8');
    for (let [index, item] of list.entries()) {
        writeStream.write(`${item.name},${item['center-cost']},${item.money} \n`, 'utf8');
    }
    writeStream.end();

    ctx.response.attachment(`${__dirname}/static/个人报销预提.csv`);
    return ctx.body = {
        code: 0,
        message: 'success',
        path: '个人报销预提.csv',
    };
});

module.exports = router;
