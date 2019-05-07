var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require("del");
var typedoc = require("gulp-typedoc");

gulp.task('clean', done => {
    del("build");
    del("docs");
    done();
});

gulp.task('jsdoc', (cb) => {
    gulp
        .src(["types/*.ts"])
        .pipe(typedoc({
            // TypeScript options (see typescript docs)
            module: "commonjs",
            target: "es5",
            includeDeclarations: true,
 
            // Output options (see typedoc docs)
            out: "./docs",
 
            // TypeDoc options (see typedoc docs)
            name: "argos.js",
            readme: "README.md",
            ignoreCompilerErrors: false,
            version: true,
        }));
});

gulp.task('build', done => {
    gulp.src('src/**/*.js')
        .pipe(babel({
            plugins: ["@babel/plugin-transform-classes", "@babel/plugin-transform-modules-commonjs"],
            presets: [
                [
                    "@babel/preset-env",
                    {
                        "targets": {
                            "node": "current"
                        }
                    }
                ]
            ]
        }))
        .pipe(gulp.dest('build'));
    done();
});

gulp.task('default', gulp.series('clean', 'build'), done => {
    done();
});