import { DataSource } from "typeorm";

export const appDataSource = new DataSource({
    type: "postgres",
    host: "bd-capstone-nanas-amas-arribasplata030303-e940.g.aivencloud.com",
    port: 28985,
    username: "avnadmin",
    password: "AVNS_MvdjVBr7NlNVnCt0Rph",
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false,
        ca: `
           MIIEQTCCAqmgAwIBAgIUH9Wpzl3PSUzFak299vYWr7TAsuMwDQYJKoZIhvcNAQEM
            BQAwOjE4MDYGA1UEAwwvMWI4OTZlNDAtMGI4My00MTQxLWE4OWItMTk4MzBlN2Nm
            NTYyIFByb2plY3QgQ0EwHhcNMjQxMDAzMjA0MTQxWhcNMzQxMDAxMjA0MTQxWjA6
            MTgwNgYDVQQDDC8xYjg5NmU0MC0wYjgzLTQxNDEtYTg5Yi0xOTgzMGU3Y2Y1NjIg
            UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKVvDH6u
            Agu6HmwHWj39citlshj88//5FSgWHtwij5/XcnazXziakYGXZK/EWAuDeOROTGwU
            pU8d4qdvs3DLUJNCKCBw+8+I3gVTSWnm68SZtNtzJ8eFCqITB0UZ43XwFBquz6A/
            rGbiwX43wpZ4ADTSECnGLHieYShvuHlKAjN+Dz01HRcV1mljyNctWwdsKPmqEa48
            IRc3St55R3bVdV9XSkIqBIVJM00RX0CEL+VnmCdBdlSjvkyo5Kqx+A5F5Rr5R0r8
            sBakixXuk/0rKRQuwu6ohukNQnOA54Xjbh8a4ivuHhuAKQz9HTQp9OBje03KEGdl
            cW9kvAfk6J3hrrsT5+YV42hnZ1h+HKyoxMF8MoLmX+2wNwI+B6x/stD0kiBZs4IN
            WJfb/IENVwFN+4YQ7VTTaLj66GdR41rxFvLdApUqQjhKJ6/s24CDs9SfpVH6hQm0
            BTyGXy01i0ExRvqeyChmG33b6+8QJVZzawDXthVApvP2iHZyB9/Y0xhz3QIDAQAB
            oz8wPTAdBgNVHQ4EFgQUQSu8a2l3u8y1U6CItsKU6fIPuQYwDwYDVR0TBAgwBgEB
            /wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAHy2GkRJKMiPHK2R
            MWxqJnY9XHlzA9tPfW9aiBrCSGR2rhF01EkEmQtEzGp7/tT6XM0rrOJtmWjKSJN2
            9qAKzt65fW8X6Vc8zhI8o+dvG6onY4PCldcBF/lu34VZjLIu0GmqHerYUds2iEAj
            fu+b5QXAkBaYZQ2SckKZIsu6ikY1lfv90gBpB0Pm9KWG7DLO9aHPU0ZFwIsvQTOq
            r/aijs1+f4mPu0PB7dve1PmItXyfItPjCmJHimjQnmBYeDZW0ydb4wxHPrsOjau4
            DVQqJnyOkcNNRjX4vymlO64/MyMvx5AqM5S1SxE8K5V4CFjrdZfbbAekUxKFYGuE
            729n2QLLJtIQGHn8Ja2DRZrtJeka3iYxo099bgiCy8C6/Cd3EFbvbUmVABZU46IG
            xxe3d3Yd+iO0B/DkK1UZr9L6oh+OFNb1YEuASO3v//cCaZCfAFDUyrurAyQaGMwX
            S3UA/kh5FCnsCMap6BNt6zwMLItqBMKnrj929oC4vaqQsFX08A==`,
    },
    entities: ["src/entities/*.ts"],
    synchronize: true,
});
