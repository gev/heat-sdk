/// <reference path='bytebuffer.d.ts' />
/*
 * The MIT License (MIT)
 * Copyright (c) 2017 Heat Ledger Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * */
import * as ByteBuffer from "./bytebuffer"
import { TransactionType } from "./transaction-type"
import { Attachment } from "./attachment"
import * as appendix from "./appendix"
import * as utils from "./utils"
import * as converters from "./converters"
import * as crypto from "./crypto"
import Long from "long"
import * as heatsdk from "./heat-sdk"

export class Builder {
  public _deadline = 1440
  public _senderPublicKey: Array<number>
  public _amountHQT: string
  public _feeHQT: string
  public _type: TransactionType
  public _version = 1
  public _attachment: Attachment
  public _recipientId: string
  public _signature: Array<number>
  public _message: appendix.AppendixMessage
  public _encryptedMessage: appendix.AppendixEncryptedMessage
  public _encryptToSelfMessage: appendix.AppendixEncryptToSelfMessage
  public _publicKeyAnnouncement: appendix.AppendixPublicKeyAnnouncement
  public _privateNameAnnouncement: appendix.AppendixPrivateNameAnnouncement
  public _privateNameAssignment: appendix.AppendixPrivateNameAssignment
  public _publicNameAnnouncement: appendix.AppendixPublicNameAnnouncement
  public _publicNameAssignment: appendix.AppendixPublicNameAssignment
  public _isTestnet: boolean
  public _timestamp: number
  public _ecBlockHeight: number
  public _ecBlockId: string

  public deadline(deadline: number) {
    this._deadline = deadline
    return this
  }
  public senderPublicKey(senderPublicKey: Array<number>) {
    this._senderPublicKey = senderPublicKey
    return this
  }
  public amountHQT(amountHQT: string) {
    this._amountHQT = amountHQT
    return this
  }
  public feeHQT(feeHQT: string) {
    this._feeHQT = feeHQT
    return this
  }
  public version(version: number) {
    this._version = version
    return this
  }
  public attachment(attachment: Attachment) {
    this._attachment = attachment
    this._type = attachment.getTransactionType()
    return this
  }
  public recipientId(recipientId: string) {
    this._recipientId = recipientId
    return this
  }
  public signature(signature: Array<number>) {
    this._signature = signature
    return this
  }
  public message(message: appendix.AppendixMessage) {
    this._message = message
    return this
  }
  public encryptedMessage(encryptedMessage: appendix.AppendixEncryptedMessage) {
    this._encryptedMessage = encryptedMessage
    return this
  }
  public encryptToSelfMessage(
    encryptToSelfMessage: appendix.AppendixEncryptToSelfMessage
  ) {
    this._encryptToSelfMessage = encryptToSelfMessage
    return this
  }
  public publicKeyAnnouncement(
    publicKeyAnnouncement: appendix.AppendixPublicKeyAnnouncement
  ) {
    this._publicKeyAnnouncement = publicKeyAnnouncement
    return this
  }
  public privateNameAnnouncement(
    privateNameAnnouncement: appendix.AppendixPrivateNameAnnouncement
  ) {
    this._privateNameAnnouncement = privateNameAnnouncement
    return this
  }
  public privateNameAssignment(
    privateNameAssignment: appendix.AppendixPrivateNameAssignment
  ) {
    this._privateNameAssignment = privateNameAssignment
    return this
  }
  public publicNameAnnouncement(
    publicNameAnnouncement: appendix.AppendixPublicNameAnnouncement
  ) {
    this._publicNameAnnouncement = publicNameAnnouncement
    return this
  }
  public publicNameAssignment(
    publicNameAssignment: appendix.AppendixPublicNameAssignment
  ) {
    this._publicNameAssignment = publicNameAssignment
    return this
  }
  public isTestnet(isTestnet: boolean) {
    this._isTestnet = isTestnet
    return this
  }
  public timestamp(timestamp: number) {
    this._timestamp = timestamp
    return this
  }
  public ecBlockId(ecBlockId: string) {
    this._ecBlockId = ecBlockId
    return this
  }
  public ecBlockHeight(ecBlockHeight: number) {
    this._ecBlockHeight = ecBlockHeight
    return this
  }

  public build(secretPhrase: string): TransactionImpl {
    return new TransactionImpl(this, secretPhrase)
  }
}

export class TransactionImpl {
  private appendages: Array<appendix.Appendix>
  private appendagesSize: number
  private height = 0x7fffffff
  private signature: Array<number>
  private type: TransactionType
  private version: number
  private timestamp: number
  private deadline: number
  private senderPublicKey: Array<number>
  private recipientId: string
  private amountHQT: string
  private feeHQT: string
  private message: appendix.AppendixMessage
  private encryptedMessage: appendix.AppendixEncryptedMessage
  private encryptToSelfMessage: appendix.AppendixEncryptToSelfMessage
  private publicKeyAnnouncement: appendix.AppendixPublicKeyAnnouncement
  private privateNameAnnouncement: appendix.AppendixPrivateNameAnnouncement
  private privateNameAssignment: appendix.AppendixPrivateNameAssignment
  private publicNameAnnouncement: appendix.AppendixPublicNameAnnouncement
  private publicNameAssignment: appendix.AppendixPublicNameAssignment
  private ecBlockHeight: number
  private ecBlockId: string
  private isTestnet: boolean

  constructor(builder: Builder, secretPhrase: string | null) {
    this.appendages = []
    this.isTestnet = builder._isTestnet
    this.timestamp = builder._timestamp
    this.type = builder._type
    this.version = builder._version
    this.deadline = builder._deadline
    this.senderPublicKey = builder._senderPublicKey
    this.recipientId = builder._recipientId
    this.amountHQT = builder._amountHQT
    this.feeHQT = builder._feeHQT
    this.signature = builder._signature
    this.message = builder._message
    this.encryptedMessage = builder._encryptedMessage
    this.encryptToSelfMessage = builder._encryptToSelfMessage
    this.publicKeyAnnouncement = builder._publicKeyAnnouncement
    this.privateNameAnnouncement = builder._privateNameAnnouncement
    this.privateNameAssignment = builder._privateNameAssignment
    this.publicNameAnnouncement = builder._publicNameAnnouncement
    this.publicNameAssignment = builder._publicNameAssignment
    this.ecBlockHeight = builder._ecBlockHeight
    this.ecBlockId = builder._ecBlockId
    this.isTestnet = builder._isTestnet
    this.senderPublicKey
    if (utils.isDefined(builder._senderPublicKey))
      this.senderPublicKey = builder._senderPublicKey
    else if (secretPhrase)
      this.senderPublicKey = converters.hexStringToByteArray(
        crypto.secretPhraseToPublicKey(secretPhrase)
      )

    if (!utils.isDefined(builder._attachment))
      throw new Error("Must provide attachment")
    this.appendages.push(builder._attachment)

    if (!utils.isDefined(builder._feeHQT))
      this.feeHQT = builder._attachment.getTransactionType().getFee()

    if (builder._message) this.appendages.push(builder._message)
    if (builder._encryptedMessage)
      this.appendages.push(builder._encryptedMessage)
    if (builder._publicKeyAnnouncement)
      this.appendages.push(builder._publicKeyAnnouncement)
    if (builder._encryptToSelfMessage)
      this.appendages.push(builder._encryptToSelfMessage)
    if (builder._privateNameAnnouncement)
      this.appendages.push(builder._privateNameAnnouncement)
    if (builder._privateNameAssignment)
      this.appendages.push(builder._privateNameAssignment)
    if (builder._publicNameAnnouncement)
      this.appendages.push(builder._publicNameAnnouncement)
    if (builder._publicNameAssignment)
      this.appendages.push(builder._publicNameAssignment)
    this.appendagesSize = 0
    this.appendages.forEach(appendage => {
      this.appendagesSize += appendage.getSize()
    })

    if (builder._signature && secretPhrase != null)
      throw new Error("Transaction is already signed")
    else if (secretPhrase) {
      let unsignedBytes = this.getUnsignedBytes()
      let unsignedHex = converters.byteArrayToHexString(unsignedBytes)
      let signatureHex = crypto.signBytes(
        unsignedHex,
        converters.stringToHexString(secretPhrase)
      )
      if (signatureHex)
        this.signature = converters.hexStringToByteArray(signatureHex)
      else throw new Error("Could not create signature")
    }
  }

  public getSignature() {
    return this.signature
  }

  public getUnsignedBytes(): Array<number> {
    let bytesHex = this.getBytesAsHex()
    let bytes = converters.hexStringToByteArray(bytesHex)
    return this.zeroSignature(bytes)
  }

  private getSize() {
    return this.signatureOffset() + 64 + 4 + 4 + 8 + this.appendagesSize
  }

  private getFlags() {
    let flags = 0
    let position = 1
    if (this.message) flags |= position
    position <<= 1
    if (this.encryptedMessage != null) flags |= position
    position <<= 1
    if (this.publicKeyAnnouncement != null) flags |= position
    position <<= 1
    if (this.encryptToSelfMessage != null) flags |= position
    position <<= 1
    if (this.privateNameAnnouncement != null) flags |= position
    position <<= 1
    if (this.privateNameAssignment != null) flags |= position
    position <<= 1
    if (this.publicNameAnnouncement != null) flags |= position
    position <<= 1
    if (this.publicNameAssignment != null) flags |= position
    return flags
  }

  private signatureOffset() {
    return 1 + 1 + 4 + 2 + 32 + 8 + 8 + 8
  }

  private zeroSignature(bytes: Array<number>): Array<number> {
    let start = this.signatureOffset()
    for (let i = start; i < start + 64; i++) {
      bytes[i] = 0
    }
    return bytes
  }

  public getBytesAsHex() {
    let size = this.getSize()
    if (this.isTestnet) size += 8

    let buffer = ByteBuffer.allocate(size).order(ByteBuffer.LITTLE_ENDIAN)
    buffer.writeByte(this.type.getType())
    buffer.writeByte((this.version << 4) | this.type.getSubtype())
    buffer.writeInt(this.timestamp)
    buffer.writeShort(this.deadline)
    for (let i = 0; i < this.senderPublicKey.length; i++)
      buffer.writeByte(this.senderPublicKey[i])

    let recipient = Long.fromString(
      this.type.canHaveRecipient() ? this.recipientId : "8150091319858025343",
      true
    )
    buffer.writeInt64(recipient)

    let amount = Long.fromString(this.amountHQT, false)
    buffer.writeInt64(amount)

    let fee = Long.fromString(this.feeHQT, false)
    buffer.writeInt64(fee)

    for (let i = 0; i < 64; i++)
      buffer.writeByte(this.signature ? this.signature[i] : 0)

    buffer.writeInt(this.getFlags())
    buffer.writeInt(this.ecBlockHeight)

    let ecBlockId = Long.fromString(this.ecBlockId, true)
    buffer.writeInt64(ecBlockId)

    this.appendages.forEach(appendage => {
      appendage.putBytes(buffer)
    })

    if (this.isTestnet) {
      // replay on main net preventer
      ;[255, 255, 255, 255, 255, 255, 255, 127].forEach(byte => {
        buffer.writeByte(byte)
      })
    }

    buffer.flip()
    return buffer.toHex()
  }

  public getJSONObject() {
    let json: { [key: string]: any } = {}
    json["type"] = this.type.getType()
    json["subtype"] = this.type.getSubtype()
    json["timestamp"] = this.timestamp
    json["deadline"] = this.deadline
    json["senderPublicKey"] = converters.byteArrayToHexString(
      this.senderPublicKey
    )
    if (this.type.canHaveRecipient()) {
      json["recipient"] = this.recipientId
    }
    json["amountHQT"] = this.amountHQT
    json["feeHQT"] = this.feeHQT
    json["ecBlockHeight"] = this.ecBlockHeight
    json["ecBlockId"] = this.ecBlockId
    json["signature"] = converters.byteArrayToHexString(this.signature)

    let attachmentJSON = {}
    this.appendages.forEach(appendage => {
      utils.extend(attachmentJSON, appendage.getJSONObject())
    })
    if (!utils.isEmpty(attachmentJSON)) {
      json["attachment"] = attachmentJSON
    }
    json["version"] = this.version
    return json
  }

  public static parse(transactionBytesHex: string) {
    let buffer = ByteBuffer.wrap(transactionBytesHex, "hex", true)

    let type = buffer.readByte() // 1
    let subtype = buffer.readByte() // 1
    let version = (subtype & 0xf0) >> 4
    subtype = subtype & 0x0f
    let timestamp = buffer.readInt() // 4
    let deadline = buffer.readShort() // 2
    let senderPublicKey: number[] = [] // 32
    for (let i = 0; i < 32; i++) senderPublicKey[i] = buffer.readByte()

    let recipientId = buffer.readLong() // 8
    let amountHQT = buffer.readLong() // 8
    let feeHQT = buffer.readLong() // 8
    let signature: number[] = [] // 64
    for (let i = 0; i < 64; i++) signature[i] = buffer.readByte()
    signature = <number[]>emptyArrayToNull(signature)
    let flags = buffer.readInt() // 4
    let ecBlockHeight = buffer.readInt() // 4
    let ecBlockId = buffer.readLong() // 8

    let transactionType = TransactionType.findTransactionType(type, subtype)
    if (!transactionType)
      throw new Error("Transaction type not implemented or undefined")
    let builder = new Builder()
      .version(version)
      .senderPublicKey(senderPublicKey)
      .amountHQT(amountHQT.toUnsigned().toString())
      .feeHQT(feeHQT.toUnsigned().toString())
      .deadline(deadline)
      .attachment(transactionType.parseAttachment(buffer))
      .timestamp(timestamp)
      .signature(signature)
      .ecBlockHeight(ecBlockHeight)
      .ecBlockId(ecBlockId.toUnsigned().toString())
    if (transactionType.canHaveRecipient())
      builder.recipientId(recipientId.toUnsigned().toString())

    let position = 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixMessage()
      a.parse(buffer)
      builder.message(a)
    }
    position <<= 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixEncryptedMessage()
      a.parse(buffer)
      builder.encryptedMessage(a)
    }
    position <<= 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixPublicKeyAnnouncement()
      a.parse(buffer)
      builder.publicKeyAnnouncement(a)
    }
    position <<= 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixEncryptToSelfMessage()
      a.parse(buffer)
      builder.encryptToSelfMessage(a)
    }
    position <<= 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixPrivateNameAnnouncement()
      a.parse(buffer)
      builder.privateNameAnnouncement(a)
    }
    position <<= 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixPrivateNameAssignment()
      a.parse(buffer)
      builder.privateNameAssignment(a)
    }
    position <<= 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixPublicNameAnnouncement()
      a.parse(buffer)
      builder.publicNameAnnouncement(a)
    }
    position <<= 1
    if ((flags & position) != 0) {
      let a = new appendix.AppendixPublicNameAssignment()
      a.parse(buffer)
      builder.publicNameAssignment(a)
    }
    if (heatsdk.default.isTestnet) buffer.readLong()

    return new TransactionImpl(builder, null)
  }
}

function emptyArrayToNull(array: number[]) {
  if (array == null) return null
  for (let i = 0; i < array.length; i++) {
    if (array[i] != 0) return array
  }
  return null
}
