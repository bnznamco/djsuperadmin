import Quill from 'quill/core';
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';
import Underline from 'quill/formats/underline'
import Strike from 'quill/formats/strike'
import Blockquote from 'quill/formats/blockquote'
import Code from 'quill/formats/code'
import Script from 'quill/formats/script'
import { SizeClass, SizeStyle } from 'quill/formats/size'
import { ColorAttributor, ColorClass, ColorStyle } from 'quill/formats/color'
import { BackgroundClass, BackgroundStyle } from 'quill/formats/background'
import { AlignAttribute, AlignClass, AlignStyle } from 'quill/formats/align'
import { FontStyle, FontClass } from 'quill/formats/font'

var Block = Quill.import('blots/block');
Block.tagName = 'DIV';
Quill.register(Block, true);


Quill.register({
  'modules/toolbar': Toolbar,
  'themes/snow': Snow,
  'formats/bold': Bold,
  'formats/italic': Italic,
  'formats/header': Header,
  'formats/underline': Underline,
  'formats/strike': Strike,
  'formats/blockquote': Blockquote,
  'formats/code': Code,
  'formats/script': Script,
  'formats/size': SizeStyle,
  'formats/color': ColorStyle,
  'formats/background': BackgroundStyle,
  'formats/align': AlignStyle,
  'formats/font': FontStyle
});


const quillFullConfig = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],

      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']
    ],
  },
  theme: 'snow'
}


const quillLiteConfig = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
    ]
  },
  theme: 'snow'
}

export { Quill, quillFullConfig, quillLiteConfig };