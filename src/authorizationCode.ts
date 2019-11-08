import AuthorizationCode from './@types/authorizationCode'

const authorizationCode: AuthorizationCode = async (auth, uri, code) => {
	if (code) {
		return await auth.code.getToken(code)
	}
	window.open(uri)
}

export default authorizationCode
