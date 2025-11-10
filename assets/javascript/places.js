var fs = require('fs');
var path = require('path');
const yaml = require('js-yaml');
const fm = require('front-matter')

let places = []
var walk = function(dir, done) {
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, places);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        places[Object.keys(res)[0]] = Object.values(res)[0]; // Assign collection directly
                        if (!--pending) done(null, places);
                    });
                } else {
                    let local_path = (file.replace(/^.*\/content\/(.*?)\.md$/, '/$1')).replace("_index", "");
                    let doc = fm(fs.readFileSync(file, 'utf8'));
                    let obj = {
                        last_name: doc.attributes.last_name,
                        uuid: doc.attributes.uuid,
                        schema: doc.attributes._schema,
                        path: local_path
                    }
                    let collection_name = path.basename(dir); // Get directory name as collection name
                    if (doc.attributes.title != "Components") {
                      if (file.toLowerCase().endsWith("_index.md")) {
                        places.push(obj);
                      } else {
                          if (!places[collection_name]) {
                            places[collection_name] = []; // Initialize collection if not exists
                          }
                          places.push(obj);
                      }
                  }
                    if (!--pending) done(null, places);
                }
            });
        });
    });
};

walk("./content/places-and-spaces", function(err, results) {
    if (err) throw err;

    Object.keys(results).forEach(key => {
        if (Array.isArray(results[key])) {
          results[key].sort((a, b) => (a.title.toLowerCase()).localeCompare(b.title.toLowerCase()));
        }
      });

    fs.writeFile('./data/places_data.json', JSON.stringify(results), err => {
      if (err) {
        console.error(err);
      } else {
        console.log("File written successfully")
      }
    });
});