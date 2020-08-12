import React, { Component } from 'react';
//  import './gameindex.css
 import axiosConfig from '../utils/axios'
 import '../styale.css'

 const URL = 'wss://f3-gs.jaqk.in/rooms/85ec04b2-ec2f-49be-8840-363370431b7d';
 
var ws = null;

export default class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data:'',
            Betbar:false,
            summaryBets: {},
            summaryNumbers: [],
            isFullscreenEnabled: false,
            min: 0,
            max: 9,
            handlerclick: "",
            values: [0, 1, 5, 10, 20, 50, 100, 200, 500, 1000],
            currentStepIndex: 0,
            balance: 0,
            showimg: false,
            number: 0,
            name: "",
            total: 0,
            userId: this.props.roomid,
            hostUrl: this.props.hostUrl,
            roomId: '',
            lastroll: '',
            currentbet: '',
            value: 0,
            ChatData: '',
            userbetplaced: {},
            dicerollnumber: {},
            numberss:'',
            playerWins: {},
            summary: {},
            smShow: '',
            statistics:{},
            lastrolls:[],
            TBR:'',
            currentbetResult:{},
            errorOccurred:false

        }
    }


    componentDidMount = () => {

        axiosConfig.get('/api/balance').then(res=>{
             if(res.data.status === 'active'){
                  
             }
        })
       
        ws = new WebSocket(URL);
        ws.onopen = () => {
            ws.send(
                JSON.stringify(
                    {
                        type: "join",
                        data: {
                            "accessToken":this.props.accessToken,
                            "roomId": this.props.roomid,
                        }
                    }));
        };

        ws.onmessage = (event) => {
            console.log("message send sever", event);
            const jsonEvent = JSON.parse(event.data);

            if (jsonEvent.type === "connection") {
                console.log('connectin event', event.data);
            };

            if (jsonEvent.type === "join-room-result") {
                const roomId = jsonEvent.data.room;
                console.log("Received roomid", roomId, jsonEvent);
                this.setState({
                    roomId: roomId
                });

                ws.send(JSON.stringify({
                    type: "sync",
                    data: {"roomId": roomId}
                }))
            };

            if (jsonEvent.type == "ping") {
                ws.send("pong");
            }

            if (jsonEvent.type === "summary") {
                this.setState({
                    summaryBets: jsonEvent.data.game.bets,
                    summaryNumbers: jsonEvent.data.game.numbers,
                    total:jsonEvent.data.totalBet,
                    currentbetResult:jsonEvent.data.betSummary,
                    TBR:jsonEvent.data.tbr
                });
            }

            if (jsonEvent.type === "start-stage") {
                this.setState({
                    settingbetsevt: jsonEvent.data.stage
                });
                // this.settingbets();
            }

            if (jsonEvent.type === "betPlaced") {
                this.setState({
                    userbetplaced: jsonEvent.data,
                    summaryNumbers: jsonEvent.data.summary.numbers,
                    TBR:jsonEvent.data.summary.tbr
                });
                // this.betalert();
            }

            if (jsonEvent.type === "diceRolled") {
                this.setState({
                    dicerollnumber: jsonEvent.data,
                });
                // this.dicerolledalert();
            }

            if (jsonEvent.type === "bet-result") {
                this.setState({
                    balance: jsonEvent.data.balance.cash,
                    total:jsonEvent.data.totalBet,
                    currentbetResult:jsonEvent.data.betSummary
                })
            }

            if (jsonEvent.type === "win") {
                let {number, winAmount, betAmount, mult} = jsonEvent.data;

                let data = this.state.playerWins
                data[number] = {betAmount: betAmount, winAmount: winAmount, mult: mult};
                this.setState({
                    playerWins: data,
                    balance: jsonEvent.data.balance.cash
                });
                // setTimeout(() => {
                //     this.open();
                // }, 15000)

            }

            if(jsonEvent.type==="statistics"){
                this.setState({
                    statistics: jsonEvent.data.stats
                })

            }

            if(jsonEvent.type==="history"){

                this.setState({
                    lastrolls:jsonEvent.data.rolls
                })
              
            }
             if(jsonEvent.type==="stop"){

                setTimeout(() => {
                     
                ws.send(
                    JSON.stringify(
                        {
                            type: "join",
                            data: {
                                "accessToken":this.props.accessToken,
                                "roomId": this.props.roomid,
                            }
                        }));


                    }, 15000)
          
                
             }
             


        };

        /// websocket onerror state
        ws.onerror = (event) => {
            console.log('[Websocket] ERROR', event);
        };

        // web socket on closes state
        ws.onclose = (event) => {
            console.log('[Websocket] Close', event);
            // this.currentbet();
        }
    };

    componentWillReceiveProps(nextProps) {
        // if (nextProps.GameBalance.status === "active") {
        //     this.setState({
        //         balance: nextProps.GameBalance.cash
        //     })
        // }
    }

    handlechangebet = () => {
        const { values, currentStepIndex, balance } = this.state;
        console.log('bet values   ', values[currentStepIndex], this.state.number, this.state.roomId);

        if (balance > values[currentStepIndex] ) {
            this.setState(prevState => ({
                handlerclick: null,
                total: parseInt(prevState.values[currentStepIndex]) + parseInt(prevState.total),
                value: 0,
                currentStepIndex: 0,
                balance: prevState.balance - prevState.values[currentStepIndex],
            }))

            ws.send(JSON.stringify(
                {type: "placeBet",
                 data: {"betValue": parseInt(this.state.values[currentStepIndex]),
                        "number": parseInt(this.state.number),
                        "roomId": this.state.roomId}}));
        } else {
            this.props.alert.error('Insufficient funds to place a bet');
        }
    }

    getInitialState() {
        return {
            showModal: false,
        };
    }

    chatevnt = (e) => {
        this.setState({ ChatData: e.target.value })
    }

    chatsubmit = (e) => {
        e.preventDefault();
        const { ChatData } = this.state;
        this.setState({
            ChatMessageData: ChatData,
            ChatData: ''
        })
    }
    open = () => {
        this.setState({
            smShow: true
        })
    }

    modelclose = () => {
        setTimeout(() => {
            this.setState({
                smShow: false
            })
        }, 20000);
    }

    handlechange = (event) => {

        this.setState({
            value: event.target.values
        });
    }


    handlerclick = () => {
        console.log('botton1');
        const { handlerclick } = this.state;
        if (handlerclick === "handlerclick") {
            this.setState({
                handlerclick: "",
                value: 0});
        } else {
            this.setState({
                handlerclick: "handlerclick",
                currentStepIndex: 0,
                number: 1
            });
        }
    }

    handlerclick1 = () => {
        console.log("hello  button2");
        const { handlerclick } = this.state;
        if (handlerclick === "handlerclick1") {
            this.setState({
                handlerclick: "",
                value: 0
            });
        } else {
            this.setState({
                handlerclick: "handlerclick1",
                // value: 0,
                currentStepIndex: 0,
                number: 2
            });

        }
    }
    handlerclick2 = () => {
        console.log("hello  button3")
        const { handlerclick } = this.state;
        if (handlerclick === "handlerclick2") {
            this.setState({
                handlerclick: "",
                value: 0
            });
        } else {
            this.setState({
                handlerclick: "handlerclick2",
                // value: 0,
                currentStepIndex: 0,
                number: 3
            });

        }

    }
    handlerclick3 = () => {
        console.log("hello  button4")
        const { handlerclick } = this.state;
        if (handlerclick === "handlerclick3") {
            this.setState({
                handlerclick: "",
                // value: 0
            });
        } else {
            this.setState({
                handlerclick: "handlerclick3",
                // value: 0,
                currentStepIndex: 0,

                number: 4
            });
        }

    }
    handlerclick4 = () => {
        console.log("hello  button5")

        const { handlerclick } = this.state;
        if (handlerclick === "handlerclick4") {
            this.setState({
                handlerclick: ""
            });
        } else {
            this.setState({
                handlerclick: "handlerclick4",
                // value: 0,
                currentStepIndex: 0,

                number: 5
            });
        }

    }
    handlerclick5 = () => {
        console.log("hello  button6")

        const { handlerclick } = this.state;
        if (handlerclick === "handlerclick5") {
            this.setState({
                handlerclick: "",
                value: 0,

            });
        } else {
            this.setState({
                handlerclick: "handlerclick5",
                // value: 0,
                currentStepIndex: 0,

                number: 6
            });
        }

    }
    handleInputChange = e => {
        this.setState({ currentStepIndex: e.currentTarget.value });
    };

    handleimg = () => {
        ws.send(JSON.stringify({ "type": "statistics", data: {"roomId": this.state.roomId } }))
        this.setState({
            showimg: !this.state.showimg
        })

    }
    handlelastroll = () => {
        ws.send(JSON.stringify({ "type": "history", data: {"roomId":     this.state.roomId } }))
        this.setState({
            lastroll: !this.state.lastroll
        })
    }

    currentbet = () => {
        this.setState({
            currentbet: !this.state.currentbet
        })
    }

    progressbar = (e) => {
        this.setState({
            value: e.target.value
        })
    }
    handlechangedbar = (e) => {

        this.setState({
            name: e.target.value
        })
    }

    handleLobby = () => {
        this.props.onHide();
        console.log('componen')
        this.props.history.push('/LobbyArena')
    }

    dicerolledalert = () => {
        setTimeout(() => {
            this.setState({
                dicealert: true
            })
        }, 5000);

        setTimeout(() => {
            this.setState({
                dicealert: false
            })
        }, 15000);
    }
    winaalert = () => {
        this.setState({
            winner: true
        })
        setTimeout(() => {
            this.setState({
                winner: false
            })
        }, 10000);
    }

    betalert = () => {

        this.setState({
            betalert: true
        })
        setTimeout(() => {
            this.setState({
                betalert: false
            })

        }, 5000);
    }
    settingbets = () => {
        this.setState({
            settingbetsalert: true
        })
        setTimeout(() => {
            this.setState({
                settingbetsalert: false

            })

        }, 4000);
    }

    close = () => {

        this.setState({
            smShow: false,
            playerWins:{}
        })


    }
    Buttondic1=()=>{
       
         this.setState({
              Betbar:true
         })
    }
    // componentWillUpdate(nextProps, nextState) {
    //     if (nextState.open == true && this.state.open == false) {
    //       this.props.onWillOpen();
    //     }
    //   }
  render() {
       const {Betbar}=this.state
    return (
        <div>
       
        {/* <h1 className={}>jeee</h1> */}
        
        <div class='mobl:hidden xsm:hidden  mac:flex mac:h-screen'>
         
         <div>
          
          <video src={require('../videos/video.mp4')} controls autoplay loop></video>
 
             <div id='sixrolls' class=' flex flex-col justify-between fixed w-206 h-379 bg-parea bg-opacity-75 inset-x-0
                 left-0 bottom-30p '>
                 <div class=' flex font-sans font-light text-white pl-4 pb-2'>Last 6 Rolls</div>
                 <div class='flex flex-row'>
                     <div class='flex   font-sans font-thin text-box  mx-1 my-4'>126</div>
                     <div class='flex m-1'>
                         {/* <img src=" ../ img/four.png" alt=""/> */}
                         <img src={require('../f3game/img/four.png')} alt=""/>
                     </div>
                     <div class='flex  m-1'>
                         
                         <img src={require('../f3game/img/two.png')} alt=""/>
                     </div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/four.png')} alt=""/>
                     </div>
                 </div>
                 <div class='flex flex-row'>
                     <div class='flex   font-sans font-thin text-box  mx-1 my-4'>125</div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/six.png')} alt=""/>
                     </div>
                     <div class='flex  m-1'>
                         <img src={require('../f3game/img/one.png')} alt=""/>
                     </div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/five.png')} alt=""/>
                     </div>
                 </div>
                 <div class='flex flex-row'>
                     <div class='flex   font-sans font-thin text-box  mx-1 my-4'>124</div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/two.png')} alt=""/>
                     </div>
                     <div class='flex  m-1'>
                         <img src={require('../f3game/img/three.png')} alt=""/>
                     </div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/five.png')} alt=""/>
                     </div>
                 </div>
                 <div class='flex flex-row'>
                     <div class='flex   font-sans font-thin text-box  mx-1 my-4'>123</div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/one.png')} alt=""/>
                     </div>
                     <div class='flex  m-1'>
                         <img src={require('../f3game/img/five.png')} alt=""/>
                     </div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/six.png')} alt=""/>
                     </div>
                 </div>
                 <div class='flex flex-row'>
                     <div class='flex   font-sans font-thin text-box  mx-1 my-4'>122</div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/six.png')} alt=""/>
                     </div>
                     <div class='flex  m-1'>
                         <img src={require('../f3game/img/six.png')} alt=""/>
                     </div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/six.png')} alt=""/>
                     </div>
                 </div>
                 <div class='flex flex-row'>
                     <div class='flex   font-sans font-thin text-box  mx-1 my-4'>121</div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/one.png')} alt=""/>
                     </div>
                     <div class='flex  m-1'>
                         <img src={require('../f3game/img/two.png')} alt=""/>
                     </div>
                     <div class='flex m-1'>
                         <img src={require('../f3game/img/three.png')} alt=""/>
                     </div>
                 </div>
             </div>
         
             <div id='chat' class=' flex flex-col justify-between fixed w-223 h-308 bg-parea bg-opacity-75
                 right-0 bottom-30p '>
                 <img src={require('../f3game/img/Chat.png')} alt=""/>
             </div>
             
             <div id='stat' class='
 
         fixed
         left-0
         bottom-0
         flex-col
         bg-parea
         bg-opacity-95
         border-gray-100
         border-opacity-25
         border-r-2
         items-center
         justify-around
         pl-6
 
         mac:w-1/4
         mac:h-1/3.3
 
 
 
 
 
 
 
         '>
                 <div class=' flex text-white  h-4 pt-4'>Statistic</div>
                 <div class='flex flex-row bottom-0  justify-around pb-2 items-center absolute'>
                 
                     <div class='flex flex-col  h-56 justify-end'>
                         <div class='flex flex-col   justify-center'>
                             <div class='flex text-white font-bold ml-4 mb-2  '>3</div>
                             <img class='flex h-12 w-2 pb-2  ml-4  ' src={require('../f3game/img/bar.png')} alt="bar"/>
                         </div>
                         <img class='flex mx-1' src={require('../f3game/img/one.png')} alt="ra"/>
                     </div>
                 
                 
                     <div class='flex flex-col  h-56 justify-end'>
                         <div class='flex flex-col   justify-center'>
                             <div class='flex text-white font-bold ml-4 mb-2  '>2</div>
                             <img class='flex h-8 w-2 pb-2  ml-4  ' src={require('../f3game/img/bar.png')} alt="bar"/>
                         </div>
                         <img class='flex mx-1' src={require('../f3game/img/two.png')} alt="ra"/>
                     </div>
                     
                     <div class='flex flex-col  h-56 justify-end'>
                         <div class='flex flex-col   justify-center'>
                             <div class='flex text-white font-bold ml-4 mb-2  '>4</div>
                             <img class='flex h-16 w-2 pb-2  ml-4  ' src={require('../f3game/img/bar.png')} alt="bar"/>
                         </div>
                         <img class='flex mx-1' src={require('../f3game/img/three.png')} alt="ra"/>
                     </div>
                     
                     <div class='flex flex-col  h-56 justify-end'>
                         <div class='flex flex-col   justify-center'>
                             <div class='flex text-white font-bold ml-4 mb-2  '>1</div>
                             <img class='flex h-4 w-2 pb-2  ml-4  ' src={require('../f3game/img/bar.png')} alt="bar"/>
                         </div>
                         <img class='flex mx-1' src={require('../f3game/img/four.png')} alt="ra"/>
                     </div>
                     
                     <div class='flex flex-col  h-56 justify-end'>
                         <div class='flex flex-col   justify-center'>
                             <div class='flex text-white font-bold ml-4 mb-2  '>5</div>
                             <img class='flex h-20 w-2 pb-2  ml-4  ' src={require('../f3game/img/bar.png')} alt="bar"/>
                         </div>
                         <img class='flex mx-1' src={require('../f3game/img/five.png')} alt="ra"/>
                     </div>
                     
                     <div class='  relative flex flex-col  h-56 justify-end'>
                         <div class='flex flex-col   justify-center'>
                             <div class='flex text-white font-bold ml-4 mb-2  '>1</div>
                             <img class='flex h-4 w-2 pb-2  ml-4  ' src={require('../f3game/img/bar.png')} alt="bar"/>
                         </div>
                         <img class='flex mx-1' src={require('../f3game/img/six.png')} alt="ra"/>
                     </div>
                 </div>
             
             </div>
             {Betbar===true&&
             
             <div  class='

           
             flex-col
             justify-between
             fixed
             bg-parea
             bg-opacity-75
 
             mac:left-22.5p
 
             air:left-
             desk:left-30p
             bottom-30p
             ml-4
 
                 '>
                 <div class='grid-container'>
                     <div class='dialogue'>
                         <div class='upper'>
                             <div class='bar'>
                                 <div class='upperbar'>
                                     <div class='innerbox  innerbox-gray'>10</div>
                                     <div class='innerbox innerbox-gray'>50</div>
                                     <div class='innerbox innerbox-gray'>100</div>
                                     <div class='innerbox innerbox-gray'>500</div>
                                     <div class='innerbox innerbox-gray'>1000</div>
                                     <div class='innerbox innerbox-red'>MAX</div>
                                 </div>
                                 <div class='lowerbar'>
                                     
                                     <div>
                                         <input type="range" min="50" max="10000" value="100" class="slider"
                                             id="myRange"/>
                                     </div>
                                     <div class='input'>
                                         
                                         <input class='input' placeholder="$ 8000" type='text' id="betAmt" value='$'/>
                                     </div>
                                 </div>
                             </div>
                             <div class='box-grid'>
                                 <img src={require('../f3game/img/Component 9.png')} alt=""/>
                             </div>
                         </div>
                         <div class='lower'>
                             <div class='rangebar'>$6000</div>
                             <div class='totalValue'>$2000</div>
                         </div>
                     </div>
                 </div>
             </div>}

             {/* betbar */}
             <div class='
 
             fixed
             flex
             flex-col
             justify-center
             items-center
             bottom-0
             left-25p
             bg-parea
             bg-opacity-95
 
             border-gray-100
             border-r-2
             border-opacity-25
             pl-6
 
 
             w-1/2
             h-1/3.3
 
             '>
                 <div class='flex flex-col   w-full justify-center items-center h-ht3/5 m-1 air:mt-3 desk:mt-4'>
                     <div class='flex justify-center items-center  w-full'>
                         <div class='flex flex-col  items-center'>
                             <div class='pr-6 pl-6'>
                                 <div class='flex text-xs text-gray-200 pb-16 align-top'>your bet</div>
                                 <div class=' text-xs justify-center align-bottom  text-white'>left to bet</div>
                             </div>
                         </div>
                         <div class='flex flex-col  items-center justify-between'>
                             <div class='flex text-xs text-gray-200 '>2500</div>
                             <div class=' flex justify-center items-center bdice '>
                                 <button onClick={this.Buttondic1}>
                                     <img src={require('../f3game/img/bdice1.png')} alt=""/>
                                 </button>
                             </div>
                             
                             <div class=' relative flex'>
                                 <img class='flex' src={require('../f3game/img/bgbrown.png')} alt="ra"/>
                                 <div class='absolute text-xs pl-2 pt-2 align-middle  text-white'>4500</div>
                             </div>
                         </div>
                         <div class='flex flex-col  items-center'>
                             <div class='flex text-xs text-gray-200 '>2500</div>
                             <button onclick="myFunction1()">
                                 <div class=' flex justify-center items-center bdice'>
                                     <img src={require('../f3game/img/bdice1.png')} alt=""/>
                                 </div>
                             </button>
                         
                             <div class=' relative flex'>
                                 <img class='flex' src={require('../f3game/img/bgbrown.png')} alt="ra"/>
                                 <div class='absolute text-xs pl-2 pt-2 align-middle  text-white'>4500</div>
                             </div>
                         </div>
                         <div class='flex flex-col  items-center'>
                             <div class='flex text-xs text-gray-200 '>2500</div>
                             <div class=' flex justify-center items-center bdice'>
                                 <img src={require('../f3game/img/bdice1.png')} alt=""/>
                             </div>
                         
                             <div class=' relative flex'>
                                 <img class='flex' src={require('../f3game/img/bgbrown.png')} alt="ra"/>
                                 <div class='absolute text-xs pl-2 pt-2 align-middle  text-white'>4500</div>
                             </div>
                         </div>
                         <div class='flex flex-col  items-center'>
                             <div class='flex text-xs text-gray-200 '>2500</div>
                             <div class=' flex justify-center items-center bdice'>
                                 <img src={require('../f3game/img/bdice1.png')} alt=""/>
                             </div>
                             
                             <div class=' relative flex'>
                                 <img class='flex' src={require('../f3game/img/bgbrown.png')} alt="ra"/>
                                 <div class='absolute text-xs pl-2 pt-2 align-middle  text-white'>4500</div>
                             </div>
                         </div>
                         <div class='flex flex-col  items-center'>
                             <div class='flex text-xs text-gray-200 '>2500</div>
                             <div class=' flex justify-center items-center bdice'>
                                 <img src={require('../f3game/img/bdice1.png')} alt=""/>
                             </div>
                             
                             <div class=' relative flex'>
                                 <img class='flex' src={require('../f3game/img/bgbrown.png')} alt="ra"/>
                                 <div class='absolute text-xs pl-2 pt-2 align-middle  text-white'>4500</div>
                             </div>
                         </div>
                         <div class='flex flex-col  items-center'>
                             <div class='flex text-xs text-gray-200 '>2500</div>
                             <div class=' flex justify-around items-center bdice'>
                                 <img src={require('../f3game/img/bdice1.png')} alt=""/>
                             </div>
                             
                             <div class=' relative flex'>
                                 <img class='flex' src={require('../f3game/img/bgbrown.png')} alt="ra"/>
                                 <div class='absolute text-xs pl-2 pt-2 align-middle  text-white'>4500</div>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 <div class='flex flex-row justify-evenly bg-parea bg-opacity-95  h-ht/5 w-full desk:mt-2'>
                     <div class='flex justify-end font-sans font-light text-white pl-2 pt-2'>Roll Number 547</div>
                     <div class='flex justify-end font-sans font-light text-white pl-56 pt-2'>Your bet $6000</div>
                 </div>
                 <div class='flex flex-col bg-parea bg-opacity-95 h-ht/5 mt-2 w-full desk:mt-4'>
                     <div class='flex justify-center  w-full h-37 relative desk:ml-16'>
                         <img src={require('../f3game/img/rect29.png')} alt="r29"/>
                         <div class='flex w-121 h-37 absolute left-0 mac:ml-8 air:ml-16'>
                             <img src={require('../f3game/img/rect30.png')} alt="r30"/>
                         </div>
                         <div class='flex  absolute font-sans font-light text-white text-base pt-2 ml-4'>Roll bet $ 12
                             500/60 000</div>
                     </div>
                 </div>
                 
             </div>
             {/* end */}
             
             <div class='
             fixed
             bottom-0
             left-75p
             flex
             flex-col
             bg-parea
             bg-opacity-95
             justify-center
 
 
             w-1/4
             h-1/3.3
             '>
                 <div class='flex flex-col'>
                     <div class='flex flex-row justify-end m-4'>
                         <div class='flex font-sans font-light text-white mr-2 justify-right items-center'>Sophia House
                         </div>
                         <div class='flex'>
                             <img src={require('../f3game/img/Group 56.png')} alt=""/>
                         </div>
                     </div>
                 </div>
                 <div class='flex flex-col'>
                     <div class='flex flex-row justify-end mr-4'>
                         <div class='flex flex-row h-8 w-8  relative justify-center items-center mx-1'>
                             <img src={require('../f3game/img/Rectangle 11.png')} alt=""/>
                             <div class='flex absolute justify-center items-center '>
                                 <img src={require('../f3game/img/Vector.png')} alt=""/>
                             </div>
                         </div>
                         <button onclick="myFunction('chat')">
                             <div
                                 class='flex flex-row h-8 w-8 bg-parea border-black border-2 relative justify-center items-center mx-1'>
                                 <img src={require('../f3game/img/Rectangle 9.png')} alt=""/>
                                 <div class='flex absolute justify-center items-center '>
                                     <img src={require('../f3game/img/Vector (1).png')} alt=""/>
                                 </div>
                             </div>
                         </button>
                         <button onclick="myFunction('sixrolls')">
                             <div
                                 class='flex flex-row h-8 w-8 bg-parea border-black border-2 relative justify-center items-center mx-1'>
                                 <img src={require('../f3game/img/Rectangle 9.png')} alt=""/>
                                 <div class='flex absolute justify-center items-center '>
                                     <img src={require('../f3game/img/Vector (2).png')} alt=""/>
                                 </div>
                             </div>
                         </button>
                         <button onclick="myFunction('stat')">
                             <div
                                 class='flex flex-row h-8 w-8 bg-parea border-black border-2 relative justify-center items-center mx-1'>
                                 <img src={require('../f3game/img/Rectangle 9.png')} alt=""/>
                                 <div class='flex absolute justify-center items-center '>
                                     <img src={require('../f3game/img/Vector (3).png')} alt=""/>
                                 </div>
                             </div>
                         </button>
                     </div>
                     <div class='flex flex-col'>
                         <div class='flex flex-row justify-end m-4'>
                             <div class='flex mx-8 relative justify-center items-center'>
                                 <img src={require('../f3game/img/Rectangle 86.png')} alt=""/>
                                 <div class='flex flex-col absolute'>
                                     <div class='flex text-xs font-sans font-bold text-white '>$30 000</div>
                                     <div class='flex text-xs font-sans font-light text-white'>Balance</div>
                                 </div>
                             </div>
                             <div class='flex mx-8 relative justify-center items-center'>
                                 <img src={require('../f3game/img/Rectangle 86.png')} alt=""/>
                                 <div class='flex flex-col absolute'>
                                     <div class='flex text-xs font-sans font-bold text-white '>$6000</div>
                                     <div class='flex  text-xs font-sans font-light text-white'>Total bet</div>
                                 </div>
                             </div>
                             <div></div>
                         </div>
                     </div>
                     <div class='flex flex-col'>
                         <div class='flex flex-row justify-end '>
                             <div class='flex mx-8 relative justify-center items-center '>
                                 <img src={require('../f3game/img/Rectangle 8.png')} alt=""/>
                                 <div class='flex flex-row justify-center absolute '>
                                     <div class='flex m-2 '>
                                         <img src={require('../f3game/img/Group 30.png')} alt=""/>
                                     </div>
                                     <div class='flex m-2 text-xs font-sans font-bold text-white '>Table</div>
                                 </div>
                             </div>
                             <div class='flex mx-8 relative justify-center items-center'>
                                 <img src={require('../f3game/img/Rectangle 8.png')} alt=""/>
                                 <div class='flex flex-row justify-between  absolute '>
                                     <div class='flex m-2 '>
                                         <img src={require('../f3game/img/Group 29.png')} alt=""/>
                                     </div>
                                     <div class='flex m-2 text-xs font-sans font-bold text-white '>Lobby</div>
                                 </div>
                             </div>
                         </div>
                     </div>
                     <div></div>
                 </div>
             </div>
             
         </div>
         
     </div>
     </div>
 
    );
  }
}
