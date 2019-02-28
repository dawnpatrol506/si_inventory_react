import React, { Component } from 'react';
import InventoryList from './components/InventoryList';
import { Input, Navbar, NavItem, Modal } from 'react-materialize';
import db from './firebase';
const moment = require('moment');

class App extends Component {
  constructor() {
    super();
    this.state = {
      parts: null,
      colors: null,
      addCode: '',
      shipCode: '',
      tracking: '',
    }

    db.collection('colors').get()
      .then(docs => {
        let arr = [];
        docs.forEach(doc => {
          arr.push({ ...doc.data(), id: doc.id });
        })
        this.setState({ colors: arr }, () => console.log(this.state))
      })

    this.getPartsByColor('BLACK', parts => this.setState({ parts }))
  }

  handleSelectChange = event => {
    const selectedColor = this.state.colors[event.target.value].name;
    this.getPartsByColor(selectedColor, parts => this.setState({ parts }));
  }

  handleTextChange = event => {
    const name = event.target.name;
    const value = event.target.value;

    if (name === 'addCode')
      this.setState({ [name]: value, isOpenAddModal: true });
    else
      this.setState({ [name]: value, isOpenAddModal: false });
  }

  shipInventory = (barcode, tracking) => {
    if (!this.verifyBarcode(barcode) || !this.verifyTracking(tracking))
      return;

    const { part, color, day, month, year, hour } = this.parseBarcode(barcode);
    const partRef = db.collection('inventory').doc(part).collection(color).doc(barcode);
    const partInfoRef = db.collection('parts').doc(part);

    partRef.get()
      .then(doc => {
        doc = doc.data();

        db.runTransaction(transaction => {
          return transaction.get(partInfoRef).then(infoDoc => {
            if (!infoDoc.exists) {
              throw "Document does not exist!"
            }

            const today = new Date();
            const wk = moment().week();
            const yr = moment().year();

            const historyStr = `salesHistory.${color.toUpperCase()}.${yr}.${wk}`;
            let historyqty = 0;
            try {
              historyqty = doc.data().salesHistory[color.toUpperCase()][yr][wk] ? doc.data().salesHistory[color.toUpperCase()][yr][wk] + 1 : 1;
            }
            catch (e) {
              historyqty = 1;
            }

            const qtyStr = `quantities.${color.toUpperCase()}`;
            const qty = doc.data().quantities[color.toUpperCase()] + 1;

            if (!doc.isTalliedForSalesData)
              transaction.update(partInfoRef, { [qtyStr]: qty, [historyStr]: historyqty });
            else
              transaction.update(partInfoRef, { [qtyStr]: qty })

            transaction.set(partRef, {
              status: 'INACTIVE',
              tracking,
              dateShipped: today,
              dateCreated: new Date(year + 2000, month - 1, day, hour, 0, 0, 0),
              isTalliedForSalesData: true
            })

          })
        })
      })
  }

  AddInventory = barcode => {
    if (!this.verifyBarcode(barcode))
      return;

    const { part, color, day, month, year, hour } = this.parseBarcode(barcode);

    const newPartRef = db.collection('inventory').doc(part).collection(color).doc(barcode);
    const partInfoRef = db.collection('parts').doc(part);

    db.runTransaction(transaction => {
      return transaction.get(partInfoRef).then(doc => {
        if (!doc.exists) {
          throw "Document does not exist!";
        }

        const qtyStr = `quantities.${color.toUpperCase()}`;
        const qty = doc.data().quantities[color.toUpperCase()] + 1;

        transaction.update(partInfoRef, { [qtyStr]: qty });
        transaction.set(newPartRef, {
          dateCreated: new Date(year + 2000, month - 1, day, hour, 0, 0, 0),
          status: 'ACTIVE'
        })
      })
    })
  }

  handlekeyUp = event => {
    const name = event.target.name;

    if (event.keyCode === 13) {
      if (this.state.isOpenAddModal) {
        this.AddInventory(this.state.addCode);
        this.setState({ [name]: '' })
        event.target.focus();
      }
      else {
        if (name === 'tracking') {
          this.shipInventory(this.state.shipCode, this.state.tracking);
          this.setState({ tracking: '', shipCode: '' })
          document.getElementById('ship-bar').focus();
        }
        else {
          document.getElementById('ship-track').focus();
        }
      }
    }
  }

  verifyBarcode = code => {
    return (code.length === 18)
  }

  verifyTracking = tracking => {
    return (tracking.length === 12)
  }

  parseBarcode = code => {
    const partObj = {};
    partObj.part = code.slice(0, 2);
    partObj.color = this.state.colors[code.slice(2, 3).charCodeAt() - 97].name;
    partObj.day = isNaN(code.slice(3, 4)) ? code.slice(3, 4).charCodeAt() - 97 : code.slice(3, 4).charCodeAt() - 22;
    partObj.month = code.slice(4, 5).charCodeAt() - 97;
    partObj.year = code.slice(5, 6).charCodeAt() - 97;
    partObj.hour = code.slice(6, 7).charCodeAt() - 97;
    return partObj;
  }

  getPartsByColor = (color, callback) => {
    const parts = [];
    db.collection('parts').get()
      .then(docs => {
        docs.forEach(doc => {
          doc = doc.data();
          if (doc.colors.indexOf(color) !== -1 && doc.quantities) {
            parts.push({ ...doc, qty: doc.quantities[color] })
          }
        })
        callback(parts);
      })
  }

  render() {
    return (
      <div>
        <Navbar brand="Inventory" className="black" right>
          <NavItem onClick={() => document.getElementById('add-modal').click()}>Add</NavItem>
          <NavItem onClick={() => document.getElementById('ship-modal').click()}>Ship</NavItem>
        </Navbar>
        <div className="container">
          <Input type="select" label="Choose a Color" defaultValue="0" onChange={this.handleSelectChange} >
            {this.state.colors ? this.state.colors.map((color, index) => {
              return <option key={index} value={index}>{color.name}</option>
            }) : null}
          </Input>
          <br />
          <InventoryList data={this.state.parts} />
        </div>
        <Modal header="Add Inventory" trigger={<a id="add-modal" hidden>add</a>}>
          <input placeholder="Barcode" label="Item to Add" name="addCode" onChange={this.handleTextChange} onKeyUp={this.handlekeyUp} value={this.state.addCode} />
        </Modal>
        <Modal header="Ship Inventory" trigger={<a id="ship-modal" hidden>ship</a>}>
          <input id="ship-bar" placeholder="Barcode" label="Item to Ship" name="shipCode" onChange={this.handleTextChange} onKeyUp={this.handlekeyUp} value={this.state.shipCode} />
          <input id="ship-track" placeholder="Tracking #" label="Tracking #" name="tracking" onChange={this.handleTextChange} onKeyUp={this.handlekeyUp} value={this.state.tracking} />
        </Modal>

      </div>
    )
  }
}

export default App;
