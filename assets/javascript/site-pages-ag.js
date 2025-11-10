var fs = require('fs');
var path = require('path');
const yaml = require('js-yaml');
const fm = require('front-matter')

let pages = []
var walk = function(dir, done) {
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, pages);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        pages[Object.keys(res)[0]] = Object.values(res)[0]; // Assign collection directly
                        if (!--pending) done(null, pages);
                    });
                } else {
                    let local_path = (file.replace(/^.*\/content\/(.*?)\.md$/, '/$1')).replace("_index", "");
                    let doc = fm(fs.readFileSync(file, 'utf8'));
                    let obj = {
                        title: doc.attributes.title,
                        id: doc.attributes.id,
                        path: local_path,
                        description: doc.attributes.description,
                        thumbnail_image: doc.attributes.thumbnail_image,
                        profile_image: doc.attributes.profile_image,
                        badge_label: doc.attributes.badge_label,
                        alternate_url: doc.attributes.alternate_url,
                        link_target: doc.attributes.link_target,
                        role: doc.attributes.role,
                        name: doc.attributes.name,
                        major: doc.attributes.major,
                        graduation_year: doc.attributes.graduation_year,
                        author: doc.attributes.author,
                        publishDate: doc.attributes.publishDate,
                        contact_details: doc.attributes.contact_details,
                        excerpt: doc.body.slice(0, doc.body.indexOf("\n")),
                        content: doc.body,
                        image: doc.attributes.image,
                        tags: doc.attributes.tags,
                        type: doc.attributes.type
                    }
                    let collection_name = path.basename(dir); // Get directory name as collection name
                    if (doc.attributes.title != "Components") {
                      if (file.toLowerCase().endsWith("_index.md")) {
                        pages.push(obj);
                      } else {
                          if (!pages[collection_name]) {
                            pages[collection_name] = []; // Initialize collection if not exists
                          }
                          pages.push(obj);
                      }
                  }
                    if (!--pending) done(null, pages);
                }
            });
        });
    });
};

walk("./content", function(err, results) {
    if (err) throw err;

    Object.keys(results).forEach(key => {
        if (Array.isArray(results[key])) {
          results[key].sort((a, b) => (a.title.toLowerCase()).localeCompare(b.title.toLowerCase()));
        }
      });

    fs.writeFile('./data/site_pages.json', JSON.stringify(results), err => {
      if (err) {
        console.error(err);
      } else {
        console.log("File written successfully")
      }
    });
});