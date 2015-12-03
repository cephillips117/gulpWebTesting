module.exports = {
    build_dir:'build',
    app_files: {
        js: ['src/**/*.js'],
        less: ['src/less/*.less'],
        html: ['src/app/**/*.html'],
        tpl_src: [
            './build/vendor/**/*.js',
            './build/app/**/*.js',
            './build/app/**/*.html',
            './build/assets/css/**/*.css'
        ]
    }
};