var http = require('http')
var fs = require('fs')
var path = require('path')
var cheerio = require('cheerio')

//爬虫的URL信息
var opt = {
	hostname: 'localhost',
	path: '/douban.html',
	port: 3000
}

//创建http get请求
http.get(opt, function(res) {
	var html = ''; // 保存抓取到的HTML源码
	var movies = []; // 保存解析HTML后的数据，即我们需要的电影信息

	//设置编码
	res.setEncoding('utf-8');
	
	// 抓取页面内容
    res.on('data', function(chunk) {
        html += chunk;
    });
    res.on('end',function(){
    	var $ = cheerio.load(html);

    	$('.item').each(function(){
    		 // 获取图片链接
    		 var picUrl = $('.pic img', this).attr('src');
    		 var movie = {
    		 	title: $('.title', this).text(),
    		 	star: $('.info .star em', this).text(),
    		 	link: $('a', this).attr('href'),
    		 	picUrl: /^http/.test(picUrl) ? picUrl : 'http://localhost:3000/' + picUrl 
    		 };
    		 //把所有电影放在一个数组里面
    		 movies.push(movie);

    		 downloadImg('img/', movie.picUrl);
    	});
    	saveData('data/data.json', movies);
    });
}).on('error', function(err) {
	console.log(err)
})

function saveData(path, movies) {
    // 调用 fs.writeFile 方法保存数据到本地
    fs.writeFile(path, JSON.stringify(movies, null, 4), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('Data saved');
    });
}

/**
 * 下载图片
 *
 * @param {string} imgDir 存放图片的文件夹
 * @param {string} url 图片的URL地址
 */
function downloadImg(imgDir, url) {
    http.get(url, function(res) {
        var data = '';

        res.setEncoding('binary');

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            // 调用 fs.writeFile 方法保存图片到本地
            fs.writeFile(imgDir + path.basename(url), data, 'binary', function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log('Image downloaded: ', path.basename(url));
            });
        });
    }).on('error', function(err) {
        console.log(err);
    });
}
