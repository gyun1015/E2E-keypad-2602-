from Crypto.PublicKey import RSA

# 완벽한 규격의 2048-bit 키 생성
key = RSA.generate(2048)
public_key = key.publickey().export_key().decode('utf-8')

print("\n=== 이 아래부터 복사해서 App.jsx의 publicKey에 붙여넣으세요 ===")
print(public_key)
print("=============================================================\n")