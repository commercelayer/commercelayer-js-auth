import { jwtDecode } from './jwtDecode.js'

describe('jwtDecode', () => {
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
      }
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
      }
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
      }
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
      }
    })
  })

  it('should be able to parse a "customer" access token (`password` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoibkdWcWFpRVlOQSIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwibWFya2V0Ijp7ImlkIjpbIkJqeHJKaHltbE0iXSwicHJpY2VfbGlzdF9pZCI6IlZCeVZwQ2d2a2ciLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsieEdYQlh1ckRNRSIsImRNcVh5dVZWa04iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwib3duZXIiOnsiaWQiOiJnT3F6Wmhacm1RIiwidHlwZSI6IkN1c3RvbWVyIn0sInNjb3BlIjoibWFya2V0OjU4IiwiZXhwIjoxNzEwOTU3NjMwLCJ0ZXN0Ijp0cnVlLCJyYW5kIjowLjkzMzMzODQ4MDYzNTE4OSwiaWF0IjoxNzEwOTQzMjMwLCJpc3MiOiJodHRwczovL2NvbW1lcmNlbGF5ZXIuaW8ifQ.sqtQx3MaI8G6KlhlTctICv5S2ER_gfd1UYi9kNsFOIDNO2pF5bvClhXke8lVZ_FCRq6ogDhirsPH6XfIETdfJmURXlqBwUm1mR3Q_QHbrjurMSbbAnx24W5r1-MAFbRLLErHN7ceVaD75wq3Z7A0VWQIdMtiI1z-k6fUcKyvRmqvONCk_kSKFFXxbofsdwOWKqqjQfc_VnzLNwZDIXKCetK2kB_JI3eGZWhqVXKQI7kWfqb9tCuomXAjUeFkzRKaw0KPiT0YMRBtkb93LOJbCnYwQ0B2l9UY-8e5sl22rqUcqg1CTm4s7hNDswZ_16MPBi6zqOcD5q6ywNI5Xg2BaA'

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
          price_list_id: 'VByVpCgvkg',
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
      }
    })
  })

  it('should be able to parse a "refreshed customer" access token (`refresh_token` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoibkdWcWFpRVlOQSIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwibWFya2V0Ijp7ImlkIjpbIkJqeHJKaHltbE0iXSwicHJpY2VfbGlzdF9pZCI6IlZCeVZwQ2d2a2ciLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsieEdYQlh1ckRNRSIsImRNcVh5dVZWa04iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwib3duZXIiOnsiaWQiOiJnT3F6Wmhacm1RIiwidHlwZSI6IkN1c3RvbWVyIn0sInNjb3BlIjoibWFya2V0OjU4IiwiZXhwIjoxNzEwOTU3NjMxLCJ0ZXN0Ijp0cnVlLCJyYW5kIjowLjQ2MjkxNTk5ODc5NDI4OTYsImlhdCI6MTcxMDk0MzIzMSwiaXNzIjoiaHR0cHM6Ly9jb21tZXJjZWxheWVyLmlvIn0.MBKSLLzxiclK7yf9ZfygrkjAgplFtJ8MSru0wgiE4qp1WUd-n3sv5T-gu26rT-wOz9bzRAstA83JopiYAUnr6ztrf2P98Ijj9bxLO02wIa1d_MMRC-ThRFM-aeoecGSfCdy3otpIBP4gB2ZhgaZ33kRnoGY9Upf-KlI5WiTrMKKHI5DhBCjfNeZZdET2En7gaK_q02_px21Tu-Txw6X_05QSJjeGC4Z2qwN_bbkO8V_8d8jMkRJZpJonoLgvQwvVzVKzvpgBMXz7hSv4XHfpmt3lgHsmLabhSCWlH32isSA-bE-PRCVXyBXTSER-bQyJfER3p3s26tIQfCB_waNE6A'

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
          price_list_id: 'VByVpCgvkg',
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
      }
    })
  })

  it('should be able to parse a "webapp" access token (`authorization_code` grant type).', () => {
    const accessToken =
      'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJlbldveEZNT25wIiwic2x1ZyI6InRoZS1ibHVlLWJyYW5kLTMiLCJlbnRlcnByaXNlIjpmYWxzZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiR1J2RGlySmxERyIsImtpbmQiOiJ3ZWJhcHAiLCJwdWJsaWMiOmZhbHNlfSwibWFya2V0Ijp7ImlkIjpbIkJqeHJKaHltbE0iXSwicHJpY2VfbGlzdF9pZCI6IlZCeVZwQ2d2a2ciLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsieEdYQlh1ckRNRSIsImRNcVh5dVZWa04iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwib3duZXIiOnsiaWQiOiJnYmxvd1N5VmVxIiwidHlwZSI6IlVzZXIifSwic2NvcGUiOiJtYXJrZXQ6aWQ6cm9iQW5oUGRHbCIsImV4cCI6MTcxMDk3NDAxOSwidGVzdCI6dHJ1ZSwicmFuZCI6MC4wNjAxMTgxNTQ5MzE0MjM5MiwiaWF0IjoxNzEwOTY2ODE5LCJpc3MiOiJodHRwczovL2NvbW1lcmNlbGF5ZXIuaW8ifQ.O89Y7MyHci-y63HcRjZoEwqHLiQ_Gs3YuawJ7M1O3D96vPpGKeymPK7on05Nq3WPCfFb7CgdFP1sgYj9ZaFq2-TCbJDyhYjbP5ewBfhYqdOyeIXerlm5tpnAEXpIPvMLL6yTdhQCj1aRe2mVVWIdxdA1-jfuXhGVYftVr68gWiQ-QGeacgPCyItcrePcsyRwWhg98zVEWradBMXc6olzSxBPNfflXEFc-A4sbfXbwyLvdB_TjoNjjF2KRGnNZX6LaB3oUPaDQN96QZs9ONjCJ49ttFmcHku3dqR60vhKU4Yo9JAi70xJAsIEjCn9pQ3Wnlwza6fkQHe-xBTeDxHFWw'

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
          price_list_id: 'VByVpCgvkg',
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
      }
    })
  })
})
