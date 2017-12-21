% # Used by "mailur.cli:icons"
% # template syntax: http://bottlepy.org/docs/dev/stpl.html
% # vim: ft=css
// Generated by "mailur icons"
@font-face {
  font-family: 'icons';
  src: url('./icons.eot?rg4e9b');
  src:
    url('./icons.eot?rg4e9b#iefix') format('embedded-opentype'),
    url('./icons.ttf?rg4e9b') format('truetype'),
    url('./icons.woff?rg4e9b') format('woff'),
    url('./icons.svg?rg4e9b#icons') format('svg');
  font-weight: normal;
  font-style: normal;
}

.--icon() {
  &::before {
    font-family: 'icons', sans-serif;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    speak: none;
    text-transform: none;
    display: inline-block;
    width: 1.4em;
    text-align: center;

    // Better Font Rendering
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

.--only-icon() {
  box-sizing: content-box;
  min-width: 1.4em;
  overflow: hidden;

  .opt--only-icons & {
    width: 1.4em;

    &::before {
      padding-right: 2em;
    }
  }
}
% for name, symbol in icons[:-1]:
.icon--{{name}},
% end
.icon--{{ icons[-1][0] }} {
  .--icon;
}
% for name, symbol in icons:

.--icon--{{name}}() {
  &::before {
    content: "{{symbol}}";
  }
}

.icon--{{name}} {
  .--icon--{{name}};
}
% end