let axios = require('axios');
let fs = require('fs');
let DomParser = require('dom-parser');

let offers = [];

let urls = ["https://www.greatdeals.com.sg/feed"];

for (let i=0; i < urls.length; i++){
  getFeeds(urls[i], i+1);
}


function getFeeds(url, index){
  axios({
      method: 'get',
      url: "https://api.rss2json.com/v1/api.json?rss_url="  + url,
      responseType: 'xml'
  })
      .then(function (response) {
          let feeds = response.data.items;
          let getOffers = new Promise((resolve, reject) => {
              feeds.forEach(feed => {
                  let description_full = new DomParser().parseFromString(feed.description, "text/xml");
                  let getDescription = new Promise((resolve, reject) => {
                      let description = [];
                      description_full.getElementsByTagName('p').forEach(p => {
                          description.push(p.innerHTML);
                      });
                      resolve(description);
                  });

                  getDescription.then((desc) => {
                      offers.push({
                          'title': feed.title,
                          'pubDate': feed.pubDate,
                          'link': feed.link,
                          'description': desc,
                          'image': feed.thumbnail
                      })
                  });
              });
              resolve(offers);
              console.log(feeds);
          });

          getOffers.then((offers) => {
              fs.writeFile(index + '.json', JSON.stringify(offers), 'utf8', function(err) {
                      if (err) throw err;
                      console.log('complete');
                  });
          })

      })
      .catch(function (error) {
          console.log(error);
      });
}
