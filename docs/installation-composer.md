# Installation via Composer

## Introduction

Composer is a very convenient and commonly used php dependency installer.

If your project is using Composer, it will have a `composer.json` file at the project root. This
automatically checks out code to the `vendor` folder in your project. Typically this folder is not
publicly visible, so automated copying is recommended. 

## Installing the vendor code

To install flot:

* add the following repository info to `composer.json`

```json
  "repositories": [
    {
      "type": "vcs",
      "url":  "https://github.com/flot/flot.git"
    }
  ]
```

* run either:
  * `composer require flot/flot`
  * (or alternatively, update all your repos): `composer update`

This will pull the flot repo and store it in `/vendor/flot/flot`

## Adding automatic code copying

As code in `vendor` is not public, this should be copied somewhere public. This can be done with an automatic code 
copy. For example, if your public script folder was at: `/public/js` and you wanted access to: `jquery.flot.js`

* add the following to script to `composer.json`

```json
    "scripts": {
        "post-autoload-dump": [
          "@php -r \"'vendor/flot/flot/source/jquery.flot.js', 'public/js/flot/jquery.flot.js');\""
        ],
```

This will automatically copy all flot files to the `/public/js/flot` folder anytime `dump-autoload` is run, such as
`composer install` or `composer update`



