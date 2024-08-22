import { InvalidTokenError } from './errors/InvalidTokenError.js'
import { TokenError } from './errors/TokenError.js'
import { jwtDecode } from './jwtDecode.js'

describe('jwtDecode', () => {
  it('should throw when the access token is not valid.', () => {
    const accessToken = 'hello-world'

    expect(() => jwtDecode(accessToken)).toThrow(InvalidTokenError)
    expect(() => jwtDecode(accessToken)).toThrow(TokenError)
    expect(() => jwtDecode(accessToken)).toThrow('Invalid token format')
  })

  it('should throw when the access token is malformed.', () => {
    const accessToken = 'header.payload.signature'
    expect(() => jwtDecode(accessToken)).toThrow()
  })

  it('should be able to parse a "dashboard" access token.', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJ1c2VyIjp7ImlkIjoiZ2Jsb3dTeVZlcSJ9LCJhcHBsaWNhdGlvbiI6eyJpZCI6Im5HVnFhaWxWeU4iLCJraW5kIjoiZGFzaGJvYXJkIiwicHVibGljIjpmYWxzZX0sInNjb3BlIjoicHJvdmlzaW9uaW5nLWFwaSBtZXRyaWNzLWFwaSIsImV4cCI6MTcxMDk3NjY5NSwidGVzdCI6ZmFsc2UsInJhbmQiOjAuNzY1MjgwMDc2MDY1MjMwNywiaWF0IjoxNzEwOTY5NDk1LCJpc3MiOiJodHRwczovL2NvbW1lcmNlbGF5ZXIuaW8ifQ.YYk1PRFa8zcAlus8uaDFcJF7FRBtXYz-h--OYyuxJ0pc_qG0jdZ7lNgKxZC0Xnb4f9QmO3nHC4b4leGm6aAw8Yw4atZZaEDEkPrlG-ZegtdM4_X2Wbeul_Swkxo91PCIkYRMue0tl-zwl3dH_bS48IGOgOCbNWIcuHFvILaN_oXOHaeGfbVY5zXFfMK8P77TWZEoK0BYvmXIv2o_x_uYQZVcev7sSy1aX2zkikMFu54PIDl-II94ETT2g51QgNglDVh64qIFRvb24uPZo3woEBtd4ogupMRY5c3BvbxtfKHeASjT2NMxSkg-J55V7L4Wv5Q3Oh5p7ePz-95n7lG7uQ'

    expect(jwtDecode(accessToken)).toStrictEqual({
      header: {
        alg: 'RS512',
        typ: 'JWT',
        kid: 'aba4cc628d1fce3fb93a3ee55826e41cfaf18dc2dff3b07222740380e9199d5d'
      },
      payload: {
        user: {
          id: 'gblowSyVeq'
        },
        application: {
          id: 'nGVqailVyN',
          kind: 'dashboard',
          public: false
        },
        scope: 'provisioning-api metrics-api',
        exp: 1710976695,
        test: false,
        rand: 0.7652800760652307,
        iat: 1710969495,
        iss: 'https://commercelayer.io'
      },
      signature:
        'YYk1PRFa8zcAlus8uaDFcJF7FRBtXYz-h--OYyuxJ0pc_qG0jdZ7lNgKxZC0Xnb4f9QmO3nHC4b4leGm6aAw8Yw4atZZaEDEkPrlG-ZegtdM4_X2Wbeul_Swkxo91PCIkYRMue0tl-zwl3dH_bS48IGOgOCbNWIcuHFvILaN_oXOHaeGfbVY5zXFfMK8P77TWZEoK0BYvmXIv2o_x_uYQZVcev7sSy1aX2zkikMFu54PIDl-II94ETT2g51QgNglDVh64qIFRvb24uPZo3woEBtd4ogupMRY5c3BvbxtfKHeASjT2NMxSkg-J55V7L4Wv5Q3Oh5p7ePz-95n7lG7uQ'
    })
  })

  it('should be able to parse a "provisioning" access token (`client_credentials` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJ1c2VyIjp7ImlkIjoiZ2Jsb3dTeVZlcSJ9LCJhcHBsaWNhdGlvbiI6eyJpZCI6Im5HVnFhaWxWeU4iLCJraW5kIjoidXNlciIsInB1YmxpYyI6ZmFsc2V9LCJzY29wZSI6InByb3Zpc2lvbmluZy1hcGkiLCJleHAiOjE3MTA5NTA0MzAsInRlc3QiOmZhbHNlLCJyYW5kIjowLjY2OTAzODQ1MzY1NjE5MzMsImlhdCI6MTcxMDk0MzIzMCwiaXNzIjoiaHR0cHM6Ly9jb21tZXJjZWxheWVyLmlvIn0.NB1PVDXU-CbatAkOKUyKDVo4e1YrracajM1JXUZCnDqGPyD2oMzCQC9ztqtOXrbvlV3FHIWm0yzd8yQvKokFjvPDDH9TvfuWgi_hFN-Dh_7IZBj0tUBfUmF694QfrUOoRfX5OX-jBkRk0IrlYUi2WleiilkSbTV9YdAiLNDWFA1MjeK7YS-QLzrrYL6RsUcII4qrDb7UZZOWiZiXTbZ1HFiSZacrZfu3Eu1BGKVUl8ZhhgYOJ1mCPlVmqn4OTnMfZby8M8Jvo3z7HDbC1-lCWMhoQ7o_PH-duA4DnaMyVrchw1S_3aSmVx6rWykvZ80d9Qz-8oSvqZwhkmnMFvUKvQ'

    expect(jwtDecode(accessToken)).toStrictEqual({
      header: {
        alg: 'RS512',
        typ: 'JWT',
        kid: 'aba4cc628d1fce3fb93a3ee55826e41cfaf18dc2dff3b07222740380e9199d5d'
      },
      payload: {
        user: {
          id: 'gblowSyVeq'
        },
        application: {
          id: 'nGVqailVyN',
          kind: 'user',
          public: false
        },
        scope: 'provisioning-api',
        exp: 1710950430,
        test: false,
        rand: 0.6690384536561933,
        iat: 1710943230,
        iss: 'https://commercelayer.io'
      },
      signature:
        'NB1PVDXU-CbatAkOKUyKDVo4e1YrracajM1JXUZCnDqGPyD2oMzCQC9ztqtOXrbvlV3FHIWm0yzd8yQvKokFjvPDDH9TvfuWgi_hFN-Dh_7IZBj0tUBfUmF694QfrUOoRfX5OX-jBkRk0IrlYUi2WleiilkSbTV9YdAiLNDWFA1MjeK7YS-QLzrrYL6RsUcII4qrDb7UZZOWiZiXTbZ1HFiSZacrZfu3Eu1BGKVUl8ZhhgYOJ1mCPlVmqn4OTnMfZby8M8Jvo3z7HDbC1-lCWMhoQ7o_PH-duA4DnaMyVrchw1S_3aSmVx6rWykvZ80d9Qz-8oSvqZwhkmnMFvUKvQ'
    })
  })

  it('should be able to parse a "sales_channel" access token (`client_credentials` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoibkdWcWFpRVlOQSIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwic2NvcGUiOiJtYXJrZXQ6YWxsIiwiZXhwIjoxNzEwOTU3NjMwLCJ0ZXN0Ijp0cnVlLCJyYW5kIjowLjM0Nzg4MjA0NDE1NDI0Njk1LCJpYXQiOjE3MTA5NDMyMzAsImlzcyI6Imh0dHBzOi8vY29tbWVyY2VsYXllci5pbyJ9.XhcMqwVwAh5wP2rbNyODBuPpTicwJjvK09KPmhe3nM1Lg0Hp0bIEQIOS81ohLyLE9ecaRH_7CsfLkAqYmRtdOTAKu9m4xvWw-Z_hBQpY67FTaikInMVltNffLvNDe5qmleNi5jnXtJl_yEGhtlDydpFBx1x8u3ofgtZSPFWm3Tl4KQoxFxT8CnnxPd2LTW_PfvnqS3QEGgvVnEXSTnJ41EU4dB8c9cZmmJY6e9SeH9fHVd469N_ipP4bymIL7kLPpkBBDuxxZ0787dOblGI31geAW-hHGbCpnj4_i5WJAVVsj_ImBtqt9Bihc-O-iHIMJlVOzWWXTAnmWGsHiwL5Ag'

    expect(jwtDecode(accessToken)).toStrictEqual({
      header: {
        alg: 'RS512',
        typ: 'JWT',
        kid: 'aba4cc628d1fce3fb93a3ee55826e41cfaf18dc2dff3b07222740380e9199d5d'
      },
      payload: {
        organization: {
          id: 'enWoxFMOnp',
          slug: 'the-blue-brand-3',
          enterprise: false,
          region: 'eu-west-1'
        },
        application: {
          id: 'nGVqaiEYNA',
          kind: 'sales_channel',
          public: true
        },
        scope: 'market:all',
        exp: 1710957630,
        test: true,
        rand: 0.34788204415424695,
        iat: 1710943230,
        iss: 'https://commercelayer.io'
      },
      signature:
        'XhcMqwVwAh5wP2rbNyODBuPpTicwJjvK09KPmhe3nM1Lg0Hp0bIEQIOS81ohLyLE9ecaRH_7CsfLkAqYmRtdOTAKu9m4xvWw-Z_hBQpY67FTaikInMVltNffLvNDe5qmleNi5jnXtJl_yEGhtlDydpFBx1x8u3ofgtZSPFWm3Tl4KQoxFxT8CnnxPd2LTW_PfvnqS3QEGgvVnEXSTnJ41EU4dB8c9cZmmJY6e9SeH9fHVd469N_ipP4bymIL7kLPpkBBDuxxZ0787dOblGI31geAW-hHGbCpnj4_i5WJAVVsj_ImBtqt9Bihc-O-iHIMJlVOzWWXTAnmWGsHiwL5Ag'
    })
  })

  it('should be able to parse an "integration" access token (`client_credentials` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiZE1uV21pZ2FwYiIsImtpbmQiOiJpbnRlZ3JhdGlvbiIsInB1YmxpYyI6ZmFsc2V9LCJzY29wZSI6Im1hcmtldDphbGwiLCJleHAiOjE3MTA5NTA0MzAsInRlc3QiOnRydWUsInJhbmQiOjAuMjE0Njc5MzMzMDQ0NTc2NzYsImlhdCI6MTcxMDk0MzIzMCwiaXNzIjoiaHR0cHM6Ly9jb21tZXJjZWxheWVyLmlvIn0.dkTswP2_lUwsKDoR8ogdCeGHgoY2zsVAl3kvX8nVBnQJh5N7ODCBGa3Rjy0MkUna7ufiAjUbuSAW8Crm8Jli3eh1WPq3nEkzjnlz8N9syRBgdKwkS46Z-3ZCEdRTBikkF38GAQIDhCqZ6ar6hIdm-6FRxDxSCzQ0zcruJc9g8EwXAO4BhvPOAw3gZ6O2uiLlQSxH3dAqg0qWehMhtZODMtFngBh38pOWbO3tRk1ojyfUq1Ckow8NyVPQa38suIf1wlrKkyKS3okP1WsN2ux7kVn8cXZ3uaP9rsKM82wICYgXfmlcxA-6AlKfgZ5ExCsCOVfubwSy8tUAGp_EPGDr9w'

    expect(jwtDecode(accessToken)).toStrictEqual({
      header: {
        alg: 'RS512',
        typ: 'JWT',
        kid: 'aba4cc628d1fce3fb93a3ee55826e41cfaf18dc2dff3b07222740380e9199d5d'
      },
      payload: {
        organization: {
          id: 'enWoxFMOnp',
          slug: 'the-blue-brand-3',
          enterprise: false,
          region: 'eu-west-1'
        },
        application: {
          id: 'dMnWmigapb',
          kind: 'integration',
          public: false
        },
        scope: 'market:all',
        exp: 1710950430,
        test: true,
        rand: 0.21467933304457676,
        iat: 1710943230,
        iss: 'https://commercelayer.io'
      },
      signature:
        'dkTswP2_lUwsKDoR8ogdCeGHgoY2zsVAl3kvX8nVBnQJh5N7ODCBGa3Rjy0MkUna7ufiAjUbuSAW8Crm8Jli3eh1WPq3nEkzjnlz8N9syRBgdKwkS46Z-3ZCEdRTBikkF38GAQIDhCqZ6ar6hIdm-6FRxDxSCzQ0zcruJc9g8EwXAO4BhvPOAw3gZ6O2uiLlQSxH3dAqg0qWehMhtZODMtFngBh38pOWbO3tRk1ojyfUq1Ckow8NyVPQa38suIf1wlrKkyKS3okP1WsN2ux7kVn8cXZ3uaP9rsKM82wICYgXfmlcxA-6AlKfgZ5ExCsCOVfubwSy8tUAGp_EPGDr9w'
    })
  })

  it('should be able to parse a "customer" access token (`password` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoibkdWcWFpRVlOQSIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwibWFya2V0Ijp7ImlkIjpbIkJqeHJKaHltbE0iXSwic3RvY2tfbG9jYXRpb25faWRzIjpbInhHWEJYdXJETUUiLCJkTXFYeXVWVmtOIl0sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sIm93bmVyIjp7ImlkIjoiZ09xelpoWnJtUSIsInR5cGUiOiJDdXN0b21lciJ9LCJzY29wZSI6Im1hcmtldDo1OCIsImV4cCI6MTcxMDk1NzYzMCwidGVzdCI6dHJ1ZSwicmFuZCI6MC45MzMzMzg0ODA2MzUxODksImlhdCI6MTcxMDk0MzIzMCwiaXNzIjoiaHR0cHM6Ly9jb21tZXJjZWxheWVyLmlvIn0.DC-XTnNf8i-4yWFq3SsVJEuDDIwXnKK6ALWw0vzizYlMb9tRk100TCcgaWiicmC86YuUmS3fsNt2d2rC9f_cE3CxBqwg8ncaSGore59pWBHMH45e6M2DR09K2oFzQk4ZJf3pngqydo_N9Ds6xGZW7vIff9Ga247pAu3-FSahjvhpKXMDkdYB769VGctYOlT1Xz1KCwB0JVpLjr7AR2i8S6R8GAdV3-YNUF_KzYm7qz0jmp7_guqUkYURHSugu9kXMkvUmb6KpyrpW-YBeE789TDra6dXK29WeEtq_nkBZKNmgPOfEEdM2RegmzEFpZNdanbtj__B_i-axqjnJ5lqMQ'

    expect(jwtDecode(accessToken)).toStrictEqual({
      header: {
        alg: 'RS512',
        typ: 'JWT',
        kid: 'aba4cc628d1fce3fb93a3ee55826e41cfaf18dc2dff3b07222740380e9199d5d'
      },
      payload: {
        organization: {
          id: 'enWoxFMOnp',
          slug: 'the-blue-brand-3',
          enterprise: false,
          region: 'eu-west-1'
        },
        application: {
          id: 'nGVqaiEYNA',
          kind: 'sales_channel',
          public: true
        },
        market: {
          id: ['BjxrJhymlM'],
          stock_location_ids: ['xGXBXurDME', 'dMqXyuVVkN'],
          geocoder_id: null,
          allows_external_prices: false
        },
        owner: {
          id: 'gOqzZhZrmQ',
          type: 'Customer'
        },
        scope: 'market:58',
        exp: 1710957630,
        test: true,
        rand: 0.933338480635189,
        iat: 1710943230,
        iss: 'https://commercelayer.io'
      },
      signature:
        'DC-XTnNf8i-4yWFq3SsVJEuDDIwXnKK6ALWw0vzizYlMb9tRk100TCcgaWiicmC86YuUmS3fsNt2d2rC9f_cE3CxBqwg8ncaSGore59pWBHMH45e6M2DR09K2oFzQk4ZJf3pngqydo_N9Ds6xGZW7vIff9Ga247pAu3-FSahjvhpKXMDkdYB769VGctYOlT1Xz1KCwB0JVpLjr7AR2i8S6R8GAdV3-YNUF_KzYm7qz0jmp7_guqUkYURHSugu9kXMkvUmb6KpyrpW-YBeE789TDra6dXK29WeEtq_nkBZKNmgPOfEEdM2RegmzEFpZNdanbtj__B_i-axqjnJ5lqMQ'
    })
  })

  it('should be able to parse a "refreshed customer" access token (`refresh_token` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoibkdWcWFpRVlOQSIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwibWFya2V0Ijp7ImlkIjpbIkJqeHJKaHltbE0iXSwic3RvY2tfbG9jYXRpb25faWRzIjpbInhHWEJYdXJETUUiLCJkTXFYeXVWVmtOIl0sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sIm93bmVyIjp7ImlkIjoiZ09xelpoWnJtUSIsInR5cGUiOiJDdXN0b21lciJ9LCJzY29wZSI6Im1hcmtldDo1OCIsImV4cCI6MTcxMDk1NzYzMSwidGVzdCI6dHJ1ZSwicmFuZCI6MC40NjI5MTU5OTg3OTQyODk2LCJpYXQiOjE3MTA5NDMyMzEsImlzcyI6Imh0dHBzOi8vY29tbWVyY2VsYXllci5pbyJ9.liTBwOIvx_LeVeBRGm4NwQCOR5F4SDVRVzaHM8uw4oihgUCo-IMktSJs8IRCyUfLfBNhsFfDjwkOXSY7-ApPT5-pMZ-cU3PP9EyFPH5pS9BpMOrhQfQaa9wYhC7r3c4MFwM7NuWRCpgie-juMWxUz1IwX-GfqCe_la6k9qwC8xdMNjfPHohjIEyfqD6TEYd69IxeBBxK_yOZ0zi4yOSo9-6y9T9i5EhMi5MPM8wHR0T9oPD0s-HrC23bMQ2s5asIzrwCRzmu1ZsQp3yf0UVpYuoNstQqUSTHWO5anh0oMipQtOphnczago85TPALDbY8AlaAZTIirXFgNHmCQpX4gQ'

    expect(jwtDecode(accessToken)).toStrictEqual({
      header: {
        alg: 'RS512',
        typ: 'JWT',
        kid: 'aba4cc628d1fce3fb93a3ee55826e41cfaf18dc2dff3b07222740380e9199d5d'
      },
      payload: {
        organization: {
          id: 'enWoxFMOnp',
          slug: 'the-blue-brand-3',
          enterprise: false,
          region: 'eu-west-1'
        },
        application: {
          id: 'nGVqaiEYNA',
          kind: 'sales_channel',
          public: true
        },
        market: {
          id: ['BjxrJhymlM'],
          stock_location_ids: ['xGXBXurDME', 'dMqXyuVVkN'],
          geocoder_id: null,
          allows_external_prices: false
        },
        owner: {
          id: 'gOqzZhZrmQ',
          type: 'Customer'
        },
        scope: 'market:58',
        exp: 1710957631,
        test: true,
        rand: 0.4629159987942896,
        iat: 1710943231,
        iss: 'https://commercelayer.io'
      },
      signature:
        'liTBwOIvx_LeVeBRGm4NwQCOR5F4SDVRVzaHM8uw4oihgUCo-IMktSJs8IRCyUfLfBNhsFfDjwkOXSY7-ApPT5-pMZ-cU3PP9EyFPH5pS9BpMOrhQfQaa9wYhC7r3c4MFwM7NuWRCpgie-juMWxUz1IwX-GfqCe_la6k9qwC8xdMNjfPHohjIEyfqD6TEYd69IxeBBxK_yOZ0zi4yOSo9-6y9T9i5EhMi5MPM8wHR0T9oPD0s-HrC23bMQ2s5asIzrwCRzmu1ZsQp3yf0UVpYuoNstQqUSTHWO5anh0oMipQtOphnczago85TPALDbY8AlaAZTIirXFgNHmCQpX4gQ'
    })
  })

  it('should be able to parse a "webapp" access token (`authorization_code` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiR1J2RGlySmxERyIsImtpbmQiOiJ3ZWJhcHAiLCJwdWJsaWMiOmZhbHNlfSwibWFya2V0Ijp7ImlkIjpbIkJqeHJKaHltbE0iXSwic3RvY2tfbG9jYXRpb25faWRzIjpbInhHWEJYdXJETUUiLCJkTXFYeXVWVmtOIl0sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sIm93bmVyIjp7ImlkIjoiZ2Jsb3dTeVZlcSIsInR5cGUiOiJVc2VyIn0sInNjb3BlIjoibWFya2V0OmlkOnJvYkFuaFBkR2wiLCJleHAiOjE3MTA5NzQwMTksInRlc3QiOnRydWUsInJhbmQiOjAuMDYwMTE4MTU0OTMxNDIzOTIsImlhdCI6MTcxMDk2NjgxOSwiaXNzIjoiaHR0cHM6Ly9jb21tZXJjZWxheWVyLmlvIn0.RhXDw7UajFr9Bxl18Q8Es82MlbXw1YcJCRe0g1-mPpDaxcBDtvHyu8GQYLpRYm-4xQ5fbg57Pzqxue0jOxv2Kcsl7XhOUHwEs9jTyS5_tfeJTQ_Ab4zKi27EFfb9NmA78xXEa1wyznVDoYvUy-PzemPPchEDezx1qrJkd0zMqnr5CJntSmfPCP22g0ljLscNUtUlbACT7xpIVXAe37XZ6_DBHOuAToleupFoyUKbNH3fRTc3FIrzexWt1m8RQALQ-QGDPljjFpnWjo3aiJQMZAu9FoZgdJn-qlbW0iYRFl91TAu8VAJ8bJJo8o3jbNdlggs9kNYFy3h15Zx3rnOUyA'

    expect(jwtDecode(accessToken)).toStrictEqual({
      header: {
        alg: 'RS512',
        typ: 'JWT',
        kid: 'aba4cc628d1fce3fb93a3ee55826e41cfaf18dc2dff3b07222740380e9199d5d'
      },
      payload: {
        organization: {
          id: 'enWoxFMOnp',
          slug: 'the-blue-brand-3',
          enterprise: false,
          region: 'eu-west-1'
        },
        application: {
          id: 'GRvDirJlDG',
          kind: 'webapp',
          public: false
        },
        market: {
          id: ['BjxrJhymlM'],
          stock_location_ids: ['xGXBXurDME', 'dMqXyuVVkN'],
          geocoder_id: null,
          allows_external_prices: false
        },
        owner: {
          id: 'gblowSyVeq',
          type: 'User'
        },
        scope: 'market:id:robAnhPdGl',
        exp: 1710974019,
        test: true,
        rand: 0.06011815493142392,
        iat: 1710966819,
        iss: 'https://commercelayer.io'
      },
      signature:
        'RhXDw7UajFr9Bxl18Q8Es82MlbXw1YcJCRe0g1-mPpDaxcBDtvHyu8GQYLpRYm-4xQ5fbg57Pzqxue0jOxv2Kcsl7XhOUHwEs9jTyS5_tfeJTQ_Ab4zKi27EFfb9NmA78xXEa1wyznVDoYvUy-PzemPPchEDezx1qrJkd0zMqnr5CJntSmfPCP22g0ljLscNUtUlbACT7xpIVXAe37XZ6_DBHOuAToleupFoyUKbNH3fRTc3FIrzexWt1m8RQALQ-QGDPljjFpnWjo3aiJQMZAu9FoZgdJn-qlbW0iYRFl91TAu8VAJ8bJJo8o3jbNdlggs9kNYFy3h15Zx3rnOUyA'
    })
  })
})
