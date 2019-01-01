# BilliesBkChangeV2
Change of background image, Version 2

This code is changing of background image with feed.

Usage
----------------------------

### HTML
```html
<div id="bkimage">
  <p>Lorem ipsum dolor sit amet.</p>
</div>
```
### JavaScript
```js
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="billiesBkchangeV2.js"></script>
<script>
var image = ['img01.jpg', 'img02.jpg', 'img03.jpg'];
var options = {speed: 3000, times: 5000};
jQuery('#bkimage').bgchanger(images, options);
</script>
```

Options
----------------------------

speed -- feed speed.

times -- interval times.

Source
----------------------------

This code is based on following code.

[jQuery.BgSwitcher](https://github.com/rewish/jquery-bgswitcher)


License
----------------------------

The [MIT License](https://github.com/SeiichiN/BilliesBkChangeV2/blob/master/LICENSE.txt), Copyright (c) 2018 [@SeiichiN](https://github.com/SeiichiN).