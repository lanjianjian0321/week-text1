const gulp = require("gulp");

const sass = require("gulp-sass");
const cssmin = require("gulp-clean-css");

const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

const htmlmin = require("gulp-htmlmin");
const webserver = require("gulp-webserver");


const path = require("path");
const fs = require("fs")

const list1 = require("./data/data.json");
gulp.task("devsass", () => {
    return gulp.src("./src/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./bulid"))
})

gulp.task("devbabel", () => {
    return gulp.src("./src/js/**/*.js")
        .pipe(babel({
            presets: ["env"]
        }))
        .pipe(gulp.dest("./bulid/js"))
})


gulp.task("watching", () => {
    return gulp.watch(["./src/js/**/*js", "./src/sass/**/*.scss"], gulp.series("devbabel", "devsass"))
})


gulp.task("server", () => {
    return gulp.src("./src")
        .pipe(webserver({
            port: 3000,
            open: true,
            livereload: true,
            proxies: [ // 拦截请求  转发请求
                { source: '/getList', target: 'http://localhost:8080/getList' },

            ]
        }))
})

gulp.task("serverData", () => {
    return gulp.src(".")
        .pipe(webserver({
            port: 8080,
            middleware: (req, res, next) => {
                let { pathname, query } = require("url").parse(req.url, true);
                console.log(pathname)

                if (pathname === "/favicon.ico") {
                    return res.end("")
                }
                pathname = pathname == "/" ? "index.html" : pathname;

                if (path.extname(pathname)) {
                    return res.end(fs.readFileSync(path.join(__dirname, "src", pathname)))
                } else {
                    switch (pathname) {
                        case "/getList/":
                            return res.end(JSON.stringify(list1))
                            break;
                    }
                }

            }


        }))
})


gulp.task("default", gulp.series("devbabel", "devsass", "server", "serverData", "watching"))