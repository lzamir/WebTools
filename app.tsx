declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

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
    <div>{sidebar}</div>
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

const categories = [
  { id: "generators", title: 'General Generators', links: linksGenerators },
  { id: "gradient", title: 'Gradient', links: linksGradient },
];

ReactDOM.render(
  <Page categories={categories} />,
  document.getElementById('root')
);