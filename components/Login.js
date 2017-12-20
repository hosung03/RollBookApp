import React, { Component } from 'react';
import {
    StyleSheet, Text, View, Image, KeyboardAvoidingView, StatusBar,
    TextInput, TouchableOpacity, Alert
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { ServiceURL,  BrandTitle } from './Const';

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userid: '',
            userpw: '',
            message: '* 아이디와 비밀번호를 모르면 행정팀에 문의하세요!'
        };

        this.onChangeMsg = this.onChangeMsg.bind(this);
    }

    onChangeMsg(msg) {
        this.setState({message:msg});
    }

    _sendLoginInfo = () => {
        const body = {
            userid: this.state.userid,
            userpw: this.state.userpw
        }
        fetch(ServiceURL+'/mobile/loginChk.php', {
        method: 'POST',
        headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(body)
        })
        .then((response) => response.json())
        .then((responseData) => { 
            if(responseData.result_code=='200'){
                if(responseData.userno==0 || responseData.userno=='' || responseData.userno==null){
                    this._callAlert(0,'잘못된 아이디 또는 비밀번호 정보입니다.');
                } else {
                    var param = {
                        userno:responseData.userno,
                        userid:this.state.userid,
                        level:responseData.level,
                        department:responseData.department,
                        grade:responseData.grade,
                        classno:responseData.classno,
                        departmentname:responseData.departmentname,
                        gradename:responseData.gradename
                    };
                    Actions.home(param);
                }
            } else {
                this._callAlert(1,'서버에러 잠시 후 다시 연결해 주시길 바랍니다.');
            }
        })
        .catch((err) => { 
            console.log("err: " + err); 
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
                {text: '닫기', onPress: () => console.log('OK Pressed')},
            ],
            { cancelable: false }
        )
    }

    render(){
        var isLogined = this.state.isLogined;
        return(
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <StatusBar barStyle='light-content' />
                <View style={styles.logoContainer}>
                    <Image 
                        style={styles.logo} 
                        source={require('../images/logo.png')}
                    />
                    <Text style={styles.title}>{BrandTitle}</Text>
                </View>
                <View style={styles.formContainer}>
                    <TextInput 
                        style={styles.input}
                        placeholder="아이디"
                        placeholderTextColor='rgba(255,255,255,0.7)'
                        returnKeyType="next"
                        ref={(input) => this.idInput = input}
                        onSubmitEditing={() => this.passwordInput.focus()}
                        onChangeText={(text) => {
                            this.setState({userid:text});
                            if(text!='' && this.state.message != '* 아이디와 비밀번호를 모르면 행정팀에 문의하세요!')
                                this.onChangeMsg('* 아이디와 비밀번호를 모르면 행정팀에 문의하세요!');
                        }}
                    />
                    <TextInput 
                        style={styles.input}
                        placeholder="비밀번호"
                        placeholderTextColor='rgba(255,255,255,0.7)'
                        secureTextEntry
                        eturnKeyType="go"
                        ref={(input) => this.passwordInput = input}
                        onChangeText={(text) => {
                            this.setState({userpw:text});
                            if(text!='' && this.state.message != '* 아이디와 비밀번호를 모르면 행정팀에 문의하세요!')
                                this.onChangeMsg('* 아이디와 비밀번호를 모르면 행정팀에 문의하세요!');
                        }}
                    />
                    <Text style={styles.messge}>{this.state.message}</Text>
                    <TouchableOpacity 
                        style={styles.buttonContaniner}
                        onPress={() => {
                            if(this.state.userid==''){
                                this.onChangeMsg('* 아아디를 입력해 주세요!');
                            } 
                            else if(this.state.userpw==''){
                                this.onChangeMsg('* 비밀번호를 입력해 주세요!');
                            }
                            else {
                                this.onChangeMsg('* 아이디와 비밀번호를 모르면 행정팀에 문의하세요!');
                                this._sendLoginInfo();
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>로그인</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex : 1,
        backgroundColor: '#8BC34A'
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
    },
    logo: {
        width: 250,
        height: 80
    },
    title: {
        marginTop: 10,
        color: '#FFF',
        textAlign: 'center',
        fontSize: 30,
    },
    formContainer: {
        padding : 20,
    },
    input: {
        height : 50,
        backgroundColor : '#AED581',
        marginBottom : 20,
        color : '#FFF',
        paddingHorizontal : 10,
    },
    buttonContaniner: {
        backgroundColor : '#33691E',
        paddingVertical : 15,
    },
    buttonText: {
        textAlign : 'center',
        color : '#FFFFFF',
        fontWeight: '700',
    },
    messge: {
        color: 'red',
        textAlign: 'center',
        paddingBottom : 15,
    },
});