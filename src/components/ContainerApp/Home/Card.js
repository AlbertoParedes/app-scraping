import React, { Component } from "react";
class Card extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style : {
        //background:` url(${this.props.card.miniCard.image}?w=720&h=400&q=95&fit=fill) center center / cover`,
        backgroundPosition: "center center",
        transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0s',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }

    };
  }

  render() {
    return (
      <div className="Card pr" onClick={() => this.props.selectPanel()}>
        <div className='image-container-home' style={this.state.style}>
          <img className={this.props.card.miniCard.classLogo} src={this.props.card.miniCard.logo} alt=''/>
        </div>
        <h6 className='pr'>{this.props.card.miniCard.title}</h6>
        <p className='pr'>{this.props.card.miniCard.bottomTitle}</p>
        
      </div>
    );
  }
}

export default Card;
