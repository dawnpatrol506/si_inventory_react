import React, { Component } from 'react';
import InventoryList from './components/InventoryList';
import { Input, Navbar, NavItem } from 'react-materialize';
import db from './firebase';

class App extends Component {
  constructor() {
    super();
    this.state = {
      parts: null,
      colors: null
    }

    db.collection('colors').orderBy('name', 'asc').get()
      .then(docs => {
        let arr = [];
        docs.forEach(doc => {
          arr.push(doc.data());
        })
        this.setState({ colors: arr })
      })
  }

  handleSelectChange = event => {
    const selectedColor = this.state.colors[event.target.value].name;
    const parts = [];

    db.collection('parts').get()
      .then(docs => {
        docs.forEach(doc => {
          doc = doc.data();
          if (doc.colors.indexOf(selectedColor) !== -1 && doc.quantities) {
            parts.push({ name: doc.name, qty: doc.quantities[selectedColor] })
          }
        })
        this.setState({ parts: parts })
      })
  }

  render() {
    return (
      <div>
        <Navbar brand="Inventory" className="black" right>
          <NavItem>Add</NavItem>
          <NavItem>Ship</NavItem>
          <NavItem>Logout</NavItem>
        </Navbar>
        <div className="container">
          <Input type="select" label="Choose a Color" defaultValue="0" onChange={this.handleSelectChange}>
            {this.state.colors ? this.state.colors.map((color, index) => {
              return <option key={index} value={index}>{color.name}</option>
            }) : null}
          </Input>
          <br />
          <InventoryList data={this.state.parts} />
        </div>
      </div>
    )
  }
}

export default App;
