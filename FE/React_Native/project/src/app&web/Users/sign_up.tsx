import React from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

const RegisterScreen = () => {
  const { width } = useWindowDimensions();

  // Kiểm tra màn hình có phải điện thoại nhỏ hay không
  const isMobile = width < 600;

  return (
    <ImageBackground
      source={require('../../../image/anhnen.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isMobile && styles.scrollContentMobile,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.login,
              isMobile && styles.loginMobile,
            ]}
          >
            <Text
              style={[
                styles.title,
                isMobile && styles.titleMobile,
              ]}
            >
              Đăng ký
            </Text>

            {/* EMAIL */}
            <Text style={styles.label}>Email</Text>

            <TextInput
              style={[
                styles.input,
                isMobile && styles.inputMobile,
              ]}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* HỌ VÀ TÊN */}
            <Text style={styles.label}>Họ và tên</Text>

            <TextInput
              style={[
                styles.input,
                isMobile && styles.inputMobile,
              ]}
              placeholder="Nhập họ và tên"
              autoCapitalize="words"
            />

            {/* SỐ ĐIỆN THOẠI */}
            <Text style={styles.label}>Số điện thoại</Text>

            <TextInput
              style={[
                styles.input,
                isMobile && styles.inputMobile,
              ]}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />

            {/* MẬT KHẨU */}
            <Text style={styles.label}>Mật khẩu</Text>

            <TextInput
              style={[
                styles.input,
                isMobile && styles.inputMobile,
              ]}
              placeholder="Nhập mật khẩu"
              secureTextEntry
            />

            {/* BUTTON */}
            <View style={styles.btn}>
              <Pressable
                style={[
                  styles.button,
                  isMobile && styles.buttonMobile,
                ]}
              >
                <Text style={styles.buttonText}>
                  Đăng ký
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  /* ========================= */
  /*        BACKGROUND          */
  /* ========================= */

  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },

  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },

  /* ========================= */
  /*        CONTAINER           */
  /* ========================= */

  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  scrollContentMobile: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  /* ========================= */
  /*           CARD             */
  /* ========================= */

  login: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',

    padding: 24,

    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,

    backgroundColor: 'rgba(255,255,255,0.9)',

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },

  loginMobile: {
    width: '100%',
    maxWidth: 420,
    padding: 18,
    borderRadius: 12,
  },

  /* ========================= */
  /*           TITLE            */
  /* ========================= */

  title: {
    color: '#d32f2f',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },

  titleMobile: {
    fontSize: 28,
    marginBottom: 20,
  },

  /* ========================= */
  /*           LABEL            */
  /* ========================= */

  label: {
    width: '100%',
    textAlign: 'left',
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },

  /* ========================= */
  /*           INPUT            */
  /* ========================= */

  input: {
    width: '100%',

    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,

    paddingHorizontal: 14,
    paddingVertical: 12,

    marginBottom: 18,

    fontSize: 16,

    backgroundColor: '#fff',
  },

  inputMobile: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 15,
    borderRadius: 8,
  },

  /* ========================= */
  /*          BUTTON            */
  /* ========================= */

  btn: {
    alignItems: 'center',
    marginTop: 8,
  },

  button: {
    backgroundColor: '#d32f2f',
    borderRadius: 15,

    paddingVertical: 14,
    paddingHorizontal: 32,

    width: '100%',

    alignItems: 'center',
  },

  buttonMobile: {
    paddingVertical: 13,
    borderRadius: 10,
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;