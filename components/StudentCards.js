import React, { Component } from 'react';
import {
    StyleSheet, Text, Image, TouchableOpacity, Dimensions,
    View, ScrollView, Switch, TextInput, Alert, TouchableHighlight
} from 'react-native';
import { Button, ButtonGroup } from 'react-native-elements';
import { CardStack, Card } from 'react-native-cardstack';
import { Picker, Item } from 'native-base'
import PopupDialog, { DialogTitle, DialogButton, SlideAnimation,
    ScaleAnimation, FadeAnimation
 } from 'react-native-popup-dialog';
import { Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';
import { Actions } from 'react-native-router-flux';
import Calendar from 'react-native-calendar';
import { ServiceURL } from './Const';

const slideAnimation = new SlideAnimation({ slideFrom: 'bottom' });
const scaleAnimation = new ScaleAnimation();
const fadeAnimation = new FadeAnimation({ animationDuration: 150 });

const { height, width } = Dimensions.get('window');
const titleAreaHeight = 130;
const bottomMenuHeight = 50;

export default class StudentCards extends Component {
	constructor(props) {
        super(props);

        this.state = {
            userno: this.props.userno,
            userid: this.props.userid,
            department: this.props.department,
            grade: this.props.grade,
            departmentname: this.props.departmentname,
            gradename: this.props.gradename,
            classno: this.props.classno,
            srchdate: '',
            teacher: '',
            students: [],  //null is problem..
            memoText: '',
            memoIdx: -1,
            memoDlgOKTitle: '메모추가',
            memoToAdmin: '',
            tabIdx:0,
            isShowCalendar: false,
        };
    }
    
    componentDidMount(){
        let department = this.state.department;
        let grade = this.state.grade;
        let gradename = this.state.gradename;
        let classno = this.state.classno;
        let srchdate = '';

        this._getStudentInfo(department,grade,gradename,classno,srchdate);
    }

    _getStudentInfo = (department,grade,gradename,classno,srchdate) => {
        var url = ServiceURL+'/mobile/rollbook.php?Department='+department+'&Grade='+grade+'&Class='+classno+'&SrchDate='+srchdate+'';
        //console.log(url);
        fetch(url)
        .then(response => response.json())
        .then(json => {
          this.setState({
            department: department,
            grade: grade,
            gradename: gradename,
            classno: classno,
            srchdate: json.srchdate,
            teacher: json.teacher,
            students: json.students,
            isShowCalendar: false
          });
        });
    }

    _sendStudentInfo = () => {
        if (this.state.userno == 0 || this.state.userno == 1000) {
            this._callAlert(0,'사용이 제한 되었습니다.');
            return;
        }
        const body = {
            department: this.state.department,
            grade: this.state.grade,
            classno: this.state.classno,
            srchdate: this.state.srchdate,
            students: this.state.students
        }
        fetch(ServiceURL+'/mobile/saverollbook.php', {
        method: 'POST',
        headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(body)
        })
        .then((response) => response.json())
        .then((responseData) => { 
            //console.log("result: " + responseData.result_code);
            if(responseData.result_code=='200'){
                this._callAlert(0,'저장되었습니다.');
            } else {
                this._callAlert(1,'서버에러 잠시 후 다시 연결해 주시길 바랍니다.');
            }
        })
        .catch((err) => { 
            //console.log("err: " + err); 
            this._callAlert(1,'서버에러 잠시 후 다시 연결해 주시길 바랍니다.');
        });
    }
    
    _sendMemoToAdmin = () => {
        if (this.state.userno == 0 || this.state.userno == 1000) {
            this._callAlert(0,'사용이 제한 되었습니다.');
            this.setState({memoToAdmin:''});
            return;
        }
        const body = {
            userno: this.state.userno,
            userid: this.state.userid,
            curdate: this.state.curdate,
            memotoadmin: this.state.memoToAdmin
        }
        fetch(ServiceURL+'/mobile/saveadminmemo.php', {
        method: 'POST',
        headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(body)
        })
        .then((response) => response.json())
        .then((responseData) => { 
            //console.log("result: " + responseData.result_code);
            if(responseData.result_code=='200'){
                this._callAlert(0,'메모가 전달되었습니다.');
                this.setState({memoToAdmin:''});
            } else {
                this._callAlert(1,'서버에러 잠시 후 다시 연결해 주시길 바랍니다.');
            }
        })
        .catch((err) => { 
            //console.log("err: " + err); 
            this._callAlert(1,'서버에러 잠시 후 다시 연결해 주시길 바랍니다.');
        });
    }

    _callAlert(type,msg) {
        var title = '알림';
        if(type==1) title = '에러';

        Alert.alert(
            title,
            msg,
            [
                {text: '닫기', onPress: () => {
                    console.log('OK Pressed');
                }},
            ],
            { cancelable: false }
        )
    }

	render() {
        var students = this.state.students;
        let cardstack = null;
        if(students.length > 0) {
            cardstack = <CardStack
                style={{paddingLeft:5, paddingRight:5 }}
                height={height-(titleAreaHeight+bottomMenuHeight+10)}
                width={width}
                transitionDuration={300}
                backgroundColor='#f8f8f8'
                hoverOffset={60}>

                {students.map((student, i) =>
                    <Card
                        key={i}
                        backgroundColor={student.Background}>
                        
                        <View>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.headerName}>{student.StudentName}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.headerTitle}>{student.Summary}</Text>
                                </View>
                            </View>

                            <View style={{paddingTop:10}}>
                                <View style={styles.detailsRow}>
                                    <View style={styles.detailsName}>
                                        <Text style={styles.detailsTitle}>출석여부: </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <Switch
                                            onValueChange={(value) => {
                                                var arrSum = students[i].Summary.split(',');
                                                if(!value){
                                                    students[i].Attend = 'n';
                                                    arrSum[0] = "결석";
                                                    students[i].Summary = arrSum.toString();
                                                } 
                                                else {
                                                    students[i].Attend = 'y'; 
                                                    arrSum[0] = "출석";
                                                    students[i].Summary = arrSum.toString();
                                                }
                                                students[i].AddOptDept = "0";
                                                arrSum[3] = "추가사항없음";
                                                this.setState({students:students});
                                            }}
                                            style={{marginBottom: 5, marginRight: 10}}
                                            value={student.Attend === 'n' ? false : true } />
                                        <Text style={styles.detailsSubTitle}>{student.Attend === 'n' ? '결석' : '출석'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View>
                                <View style={styles.detailsRow}>
                                    <View style={styles.detailsName}>
                                        <Text style={styles.detailsTitle}>포인트갯수: </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <Picker
                                            mode="dropdown"
                                            note={false}
                                            style={{backgroundColor:'white'}}
                                            selectedValue={student.Talent}
                                            onValueChange={(value) => {
                                                students[i].Talent = value;
                                                var arrSum = students[i].Summary.split(',');
                                                arrSum[1] = "포인트 "+value+"개";
                                                students[i].Summary = arrSum.toString();
                                                this.setState({students:students});
                                            }}
                                            >
                                            <Item label="포인트 0개" value="0" />
                                            <Item label="포인트 1개" value="1" />
                                            <Item label="포인트 2개" value="2" />
                                            <Item label="포인트 3개" value="3" />
                                            <Item label="포인트 4개" value="4" />
                                            <Item label="포인트 5개" value="5" />
                                            <Item label="포인트 6개" value="6" />
                                            <Item label="포인트 7개" value="7" />
                                            <Item label="포인트 8개" value="8" />
                                            <Item label="포인트 9개" value="9" />
                                            <Item label="포인트 10개" value="10" />
                                        </Picker> 
                                    </View>
                                </View>
                            </View>

                            <View>
                                <View style={styles.detailsRow}>
                                    <View style={styles.detailsName}>
                                        <Text style={styles.detailsTitle}>어묵수행: </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <Switch
                                            onValueChange={(value) => {
                                                if(value){
                                                    students[i].QT = 'y';
                                                    var arrSum = students[i].Summary.split(',');
                                                    arrSum[2] = "어묵0";
                                                    students[i].Summary = arrSum.toString();
                                                } 
                                                else {
                                                    students[i].QT = 'n'; 
                                                    var arrSum = students[i].Summary.split(',');
                                                    arrSum[2] = "어묵X";
                                                    students[i].Summary = arrSum.toString();
                                                }
                                                this.setState({students:students});
                                            }}
                                            style={{marginBottom: 5, marginRight: 10}}
                                            value={student.QT === 'n' ? false : true } />
                                        <Text style={styles.detailsSubTitle}>{student.QT === 'y' ? '어묵0' : '어묵X'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View>
                                <View style={styles.detailsRow}>
                                    <View style={styles.detailsName}>
                                        <Text style={styles.detailsTitle}>추가사항: </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        { students[i].Attend === "n" ? (
                                        <Picker
                                            mode="dropdown"
                                            note={false}
                                            style={{backgroundColor:'white'}}
                                            selectedValue={student.AddOptDept}
                                            onValueChange={(value) => {
                                                students[i].AddOptDept = value;
                                                var arrSum = students[i].Summary.split(',');
                                                if(value=="0") arrSum[3] = "추가X";
                                                else arrSum[3] = "추가O";
                                                students[i].Summary = arrSum.toString();
                                                this.setState({students:students});
                                            }}
                                            >
                                            <Item label="없음" value="0" />
                                            <Item label="장기결석" value="1" />
                                            <Item label="병결" value="2" />
                                            <Item label="여행" value="3" />
                                        </Picker> 
                                        ) : ( 
                                        <Picker
                                            mode="dropdown"
                                            note={false}
                                            style={{backgroundColor:'white'}}
                                            selectedValue={student.AddOptDept}
                                            onValueChange={(value) => {
                                                students[i].AddOptDept = value;
                                                var arrSum = students[i].Summary.split(',');
                                                if(value=="0") arrSum[3] = "추가X";
                                                else arrSum[3] = "추가O";
                                                students[i].Summary = arrSum.toString();
                                                this.setState({students:students});
                                            }}
                                            >
                                            <Item label="없음" value="0" />
                                            <Item label="타부서출석" value="1" />
                                            <Item label="타교회출석(주보제출)" value="2" />
                                        </Picker> 
                                        )}
                                    </View>
                                </View>
                            </View>

                            <View>
                                <View style={styles.detailsMomoRow}>
                                    <View style={styles.detailsName}>
                                        <Text style={styles.detailsTitle}>메모내역: </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <Button
                                            buttonStyle={{
                                                marginLeft: -15,
                                                backgroundColor: 'white', 
                                                borderRadius: 5 }}
                                            textStyle={{textAlign: 'center', color:'#000'}}
                                            onPress={() => {
                                                this.setState({memoIdx: i, memoText:students[i].RollbookMemo});
                                                this.popupMemoDialog.show();
                                                this.refs.memoTextInput.focus();
                                            }}
                                            title={student.RollbookMemo === '' ? "메모추가" : "메모변경"}
                                        />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <Text style={styles.detailsSummary}>
                                        {student.RollbookMemo}
                                    </Text>
                                </View>
                            </View>

                        </View>
                    </Card>
                )}
            </CardStack>
        }

        const customDayHeadings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const customMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let bodyView = null;
        if(this.state.isShowCalendar) {
            bodyView = <View style={{justifyContent: 'flex-start'}}>
            <Calendar
                currentMonth={this.state.srchdate}       
                dayHeadings={customDayHeadings}              
                monthNames={customMonthNames}
                nextButtonText={'Next'}           
                onDateSelect={(date) => {
                    var d = new Date(date);
                    if(d.getDay()!=0) {
                        this._callAlert(1,'선택하신 날짜는 일요일이 아니네요. 다른 날짜를 선택해 주세요!');    
                    } else {
                        var dateFormat = d.getFullYear();
                        dateFormat += "-";
                        if(d.getMonth() + 1 < 10) dateFormat += "0"+ d.getMonth() + 1;
                        else dateFormat += d.getMonth() + 1;
                        dateFormat += "-";
                        if(d.getDate() < 10) dateFormat += "0"+ d.getDate();
                        else dateFormat += d.getDate();

                        let department = this.state.department;
                        let grade = this.state.grade;
                        let gradename = this.state.gradename;
                        let classno = this.state.classno;
                        let srchdate = dateFormat;

                        this._getStudentInfo(department,grade,gradename,classno,srchdate);
                    }
                }} 
                prevButtonText={'Prev'}          
                removeClippedSubviews={false}    
                scrollEnabled={true}              
                selectedDate={this.state.srchdate} 
                showControls={true}               
                showEventIndicators={true}        
                titleFormat={'YYYY MMMM'}         
                today={new Date()}
                weekStart={1}
            />
            </View>
        } else {
            bodyView = <ScrollView>
                {cardstack}
            </ScrollView>
        }

		return(
            <View style={styles.container}>
                <View style={{ height: titleAreaHeight, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.exampleTitle}>{''+this.state.departmentname+' '+this.state.gradename+' '+this.state.classno+'반 출석 현황'}</Text>
                    <Text style={styles.exampleTitle}>{'('+this.state.teacher+' 선생님)'}</Text>
                    <View style={styles.dateTouchBody}>
                        <Image
                            style={styles.dateIcon}
                            source={require('../images/date_icon.png')}
                        />
                        <TouchableHighlight
                            style={styles.dateButton}
                            onPress={() => {
                                this.setState({
                                    isShowCalendar: true,
                                }); 
                            }}
                            >
                            <Text> {this.state.srchdate} </Text>
                        </TouchableHighlight>
                    </View>
                </View>
                {bodyView}
                <PopupDialog
                    ref={(popupDialog) => {
                        this.popupMemoDialog = popupDialog;
                    }}
                    dialogAnimation={scaleAnimation}
                    dialogTitle={<DialogTitle title="메모 작성 (1000자 이내)" />}
                    >
                    <View style={styles.dialogContentView}>
                        <TextInput
                            ref="memoTextInput"
                            style={{marginLeft:10, marginRight:10}}
                            multiline={true}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({memoText:text});
                            }}
                            value={this.state.memoText}
                            maxLength={1000}
                            underlineColorAndroid={'transparent'}
                            autoCapitalize={'sentences'}
                            onSubmitEditing={() => {
                                this.refs.memoTextInput.focus();
                            }}
                        />
                    </View>
                    <View style={{flexDirection: 'row',  justifyContent: 'center', alignItems: 'center'}}>
                        <DialogButton
                            text="닫기"
                            onPress={() => {
                                this.setState({memoIdx: -1, memoText:''});
                                this.popupMemoDialog.dismiss();
                            }}
                            key="memo_close"
                        />
                        <DialogButton
                            text={this.state.memoDlgOKTitle}
                            onPress={() => {
                                if(this.state.memoIdx > -1 && this.state.memoIdx < 100)  {
                                    var arrSum = students[this.state.memoIdx].Summary.split(',');
                                    if(this.state.memoText != '') {
                                        students[this.state.memoIdx].RollbookMemo = this.state.memoText;
                                        arrSum[4] = "메모O";
                                    } else {
                                        students[this.state.memoIdx].RollbookMemo = '';
                                        arrSum[4] = "메모X";
                                    }
                                    students[this.state.memoIdx].Summary = arrSum.toString();
                                    this.setState({students:students});
                                } else if(this.state.memoIdx == 100){
                                    var memoText = this.state.memoText;
                                    if(memoText!=''){
                                        this.setState({memoToAdmin:memoText, memoDlgOKTitle:'메모추가'});
                                        console.log("memo");
                                        this._sendMemoToAdmin();
                                    }
                                }
                                this.setState({memoIdx: -1, memoText:''});
                                this.popupMemoDialog.dismiss();
                            }}
                            key="memo_save"
                        />
                    </View>
                </PopupDialog>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', height: bottomMenuHeight }}>
                    <ButtonGroup
                        selectedBackgroundColor="gray"
                        onPress={(index) => {
                            this.setState({tabIdx: index});
                            if(index==0){
                                this._sendStudentInfo();
                            } else if(index==1){
                                var memotoAdmin = this.state.memoToAdmin;
                                this.setState({memoIdx: 100, memoText: memotoAdmin, memoDlgOKTitle:'메모전달'});
                                this.popupMemoDialog.show();
                                this.refs.memoTextInput.focus();
                            } else if(index==2){
                                Actions.reset('login');
                            }
                        }}
                        selectedIndex={this.state.tabIdx}
                        buttons={['저장', '헹정팀에게\n전달메모', '로그아웃']}
                        containerStyle={{width:width, height: bottomMenuHeight, padding: 0, margin: 0}} 
                    />
                </View>
            </View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 20,
		flex: 1,
		justifyContent: 'space-between',
	},
	exampleTitle: {
		fontSize: 25,
	},
	cardHeader: {
		flexDirection: 'row',
		height: 40,
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 20,
		paddingRight: 20,
	},
	headerName: {
		margin: 0,
		fontWeight: '500',
		fontSize: 23,
		color: '#fff',
		textAlign: 'right'
	},
	headerTitle: {
		marginTop: 4,
		fontWeight: '300',
		fontSize: 16,
		color: '#fff',
	},
	detailsRow: {
		flexDirection: 'row',
		paddingLeft: 20,
		paddingRight: 20,
		marginBottom: 20,
    },
    detailsMomoRow: {
		flexDirection: 'row',
		paddingLeft: 20,
		paddingRight: 20,
    },
    detailsName: {
		alignItems: 'center',
		width: 100,
		height: 35,
		marginRight: 10,
		alignSelf: 'flex-start',
		borderColor: 'rgba(255, 255, 255, 0.8)',
	},
	detailsTitle: {
		fontWeight: '500',
		fontSize: 19,
		color: '#fff',
		marginTop: 5,
		fontStyle: 'italic',
    },
    detailsSubTitle: {
		fontWeight: '500',
		fontSize: 19,
		color: '#fff',
		marginTop: 5,
		fontStyle: 'italic',
	},
	detailsSummary: {
		fontWeight: '300',
		color: '#fff',
		lineHeight: 22,
		width: 300,
    },
    dialogContentView: {
        flex: 1
    },
    dateTouchBody: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateIcon: {
        width: 32,
        height: 32,
        marginLeft: 5,
        marginRight: 5
    },
    dateButton: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10
    },
});
