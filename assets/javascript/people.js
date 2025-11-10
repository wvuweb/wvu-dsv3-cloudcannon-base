var fs = require('fs');
var path = require('path');
const yaml = require('js-yaml');
const fm = require('front-matter')

let people = []
var walk = function(dir, done) {
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, people);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        people[Object.keys(res)[0]] = Object.values(res)[0]; // Assign collection directly
                        if (!--pending) done(null, people);
                    });
                } else {
                    let local_path = (file.replace(/^.*\/content\/(.*?)\.md$/, '/$1')).replace("_index", "");
                    let doc = fm(fs.readFileSync(file, 'utf8'));
                    let obj = {
                        building: doc.attributes.building,
                        last_name: doc.attributes.last_name,
                        description: doc.attributes.description,
                        dir_include: doc.attributes.dir_include,
                        email: doc.attributes.email,
                        uuid: doc.attributes.uuid,
                        is_contact: doc.attributes.is_contact,
                        schema: doc.attributes._schema,
                        name: doc.attributes.name,
                        job_position: doc.attributes.job_position,
                        last_name: doc.attributes.last_name,
                        majors: doc.attributes.majors,
                        phone: doc.attributes.phone,
                        position: doc.attributes.position,
                        profile_image: doc.attributes.profile_image,
                        graduation_year: doc.attributes.graduation_year,
                        hometown: doc.attributes.hometown,
                        staff_contact_info: doc.attributes.staff_contact_info,
                        tags: doc.attributes.tags,
                        type: doc.attributes.type,
                        path: local_path
                    }
                    let collection_name = path.basename(dir); // Get directory name as collection name
                    if (doc.attributes.title != "Components") {
                      if (file.toLowerCase().endsWith("_index.md")) {
                        people.push(obj);
                      } else {
                          if (!people[collection_name]) {
                            people[collection_name] = []; // Initialize collection if not exists
                          }
                          people.push(obj);
                      }
                  }
                    if (!--pending) done(null, people);
                }
            });
        });
    });
};

walk("./content/people", function(err, results) {
    if (err) throw err;

    Object.keys(results).forEach(key => {
        if (Array.isArray(results[key])) {
          results[key].sort((a, b) => (a.title.toLowerCase()).localeCompare(b.title.toLowerCase()));
        }
      });

    fs.writeFile('./data/people_data.json', JSON.stringify(results), err => {
      if (err) {
        console.error(err);
      } else {
        console.log("File written successfully")
      }
    });
});