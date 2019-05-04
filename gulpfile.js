var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require("del");

gulp.task('clean', done => {
    del("build");
    done();
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

gulp.task('default', gulp.series('clean', 'build') , done => {
    done();
});