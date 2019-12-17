"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require('react');
var ReactDOM = require('react-dom');
require("./styles/general.css");
function List(props) {
    var sidebar = (React.createElement("ul", null, props.links.map(function (link) {
        return React.createElement("li", { key: link.id },
            React.createElement("a", { target: "_blank", href: link.ref }, link.title));
    })));
    return (React.createElement("div", null, sidebar));
}
function Header(props) {
    var header = (React.createElement("h1", null, "Lior Zamir Recommended Web Tools for Developers"));
    return (React.createElement("div", null, header));
}
function Page(props) {
    var sidebar = (React.createElement("ul", null, props.categories.map(function (category) {
        return React.createElement("li", { key: category.id },
            React.createElement("h2", null, category.title),
            React.createElement(List, { links: category.links }));
    })));
    return (React.createElement("div", null,
        React.createElement(Header, null),
        sidebar));
}
var linksGenerators = [
    { id: 1, title: 'css3generator.com', ref: 'https://css3generator.com' },
    { id: 2, title: 'css3maker.com', ref: 'https://www.css3maker.com' },
    { id: 3, title: 'css3.mikeplate.com', ref: 'https://css3.mikeplate.com' },
    { id: 4, title: 'css3gen.com', ref: 'https://css3gen.com' }
];
var linksGradient = [
    { id: 1, title: 'UltiUltimate CSS Gradient Generator', ref: 'https://www.colorzilla.com/gradient-editor' },
    { id: 2, title: 'westciv.com/tools/gradients', ref: 'http://westciv.com/tools/gradients' },
];
var linksButtons = [
    { id: 1, title: 'cssbuttoncreator.com', ref: 'https://cssbuttoncreator.com' },
    { id: 2, title: 'bestcssbuttongenerator.com', ref: 'https://www.bestcssbuttongenerator.com' },
    { id: 3, title: 'css3gen.com/button-generator', ref: 'https://css3gen.com/button-generator' },
    { id: 4, title: 'loading.io/button/generator', ref: 'https://loading.io/button/generator' },
];
var categories = [
    { id: "generators", title: 'General CSS Generators', links: linksGenerators },
    { id: "gradient", title: 'CSS Gradient Generators', links: linksGradient },
    { id: "buttons", title: 'CSS Buttons Generators', links: linksButtons },
];
ReactDOM.render(React.createElement(Page, { categories: categories }), document.getElementById('root'));
//# sourceMappingURL=app.js.map