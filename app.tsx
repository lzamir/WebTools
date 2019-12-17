declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

import './styles/general.css';

function List(props) {
  const sidebar = (
    <ul>
      {props.links.map((link) =>
        <li key={link.id}>
          <a target="_blank" href={link.ref}>{link.title}</a>
        </li>
      )}
    </ul>
  );

  return (
    <div>{sidebar}</div>
  );
}

function Header(props) {
  const header = (
    <h1>
      Lior Zamir Recommended Web Tools for Developers
    </h1>
  );

  return (
    <div>{header}</div>
  );
}

function Page(props) {
  const sidebar = (
    <ul>
      {props.categories.map((category) =>
        <li key={category.id}><h2>{category.title}</h2>
          <List links={category.links} />
        </li>
      )}
    </ul>
  );

  return (
    <div><Header />{sidebar}</div>
  );
}

const linksGenerators = [
  { id: 1, title: 'css3generator.com', ref: 'https://css3generator.com' },
  { id: 2, title: 'css3maker.com', ref: 'https://www.css3maker.com' },
  { id: 3, title: 'css3.mikeplate.com', ref: 'https://css3.mikeplate.com' },
  { id: 4, title: 'css3gen.com', ref: 'https://css3gen.com' }
];

const linksGradient = [
  { id: 1, title: 'UltiUltimate CSS Gradient Generator', ref: 'https://www.colorzilla.com/gradient-editor' },
  { id: 2, title: 'westciv.com/tools/gradients', ref: 'http://westciv.com/tools/gradients' },
];

const linksButtons = [
  { id: 1, title: 'cssbuttoncreator.com', ref: 'https://cssbuttoncreator.com' },
  { id: 2, title: 'bestcssbuttongenerator.com', ref: 'https://www.bestcssbuttongenerator.com' },
  { id: 3, title: 'css3gen.com/button-generator', ref: 'https://css3gen.com/button-generator' },
  { id: 4, title: 'loading.io/button/generator', ref: 'https://loading.io/button/generator' },
];

const categories = [
  { id: "generators", title: 'General CSS Generators', links: linksGenerators },
  { id: "gradient", title: 'CSS Gradient Generators', links: linksGradient },
  { id: "buttons", title: 'CSS Buttons Generators', links: linksButtons },
];

ReactDOM.render(
  <Page categories={categories} />,
  document.getElementById('root')
);