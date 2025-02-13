"use client"

import { createChallenge } from "@/lib/client/webauthn"
import { decodeBase64, encodeBase64 } from "@oslojs/encoding"
import { useActionState, useState } from "react"
import { registerPasskeyAction } from "./actions"

import type { User } from "@/lib/server/user"
import { AuthCard } from "@/components/auth-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const initialRegisterPasskeyState = {
  message: "",
}

export function RegisterPasskeyForm(props: {
  encodedCredentialUserId: string
  user: User
  encodedCredentialIds: string[]
}) {
  const [encodedAttestationObject, setEncodedAttestationObject] = useState<
    string | null
  >(null)
  const [encodedClientDataJSON, setEncodedClientDataJSON] = useState<
    string | null
  >(null)
  const [formState, action] = useActionState(
    registerPasskeyAction,
    initialRegisterPasskeyState
  )
  return (
    <AuthCard title="Register passkey">
      <Button
        className="w-full mb-4"
        disabled={
          encodedAttestationObject !== null && encodedClientDataJSON !== null
        }
        onClick={async () => {
          const challenge = await createChallenge()
          const credential = await navigator.credentials.create({
            publicKey: {
              challenge,
              user: {
                displayName: props.user.username,
                id: decodeBase64(props.encodedCredentialUserId),
                name: props.user.email,
              },
              rp: {
                name: "Next.js WebAuthn example",
              },
              pubKeyCredParams: [
                {
                  alg: -7,
                  type: "public-key",
                },
                {
                  alg: -257,
                  type: "public-key",
                },
              ],
              attestation: "none",
              authenticatorSelection: {
                userVerification: "required",
                residentKey: "required",
                requireResidentKey: true,
              },
              excludeCredentials: props.encodedCredentialIds.map((encoded) => {
                return {
                  id: decodeBase64(encoded),
                  type: "public-key",
                }
              }),
            },
          })

          if (!(credential instanceof PublicKeyCredential)) {
            throw new Error("Failed to create public key")
          }
          if (
            !(credential.response instanceof AuthenticatorAttestationResponse)
          ) {
            throw new Error("Unexpected error")
          }

          setEncodedAttestationObject(
            encodeBase64(new Uint8Array(credential.response.attestationObject))
          )
          setEncodedClientDataJSON(
            encodeBase64(new Uint8Array(credential.response.clientDataJSON))
          )
        }}
      >
        Create credential
      </Button>
      <form action={action}>
        <div className="grid gap-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Credential name</Label>
              <Input
                id="name"
                name="name"
                type="name"
                placeholder="My Credential"
                required
              />
            </div>
            <input
              type="hidden"
              name="attestation_object"
              value={encodedAttestationObject ?? ""}
            />
            <input
              type="hidden"
              name="client_data_json"
              value={encodedClientDataJSON ?? ""}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={
                encodedAttestationObject === null &&
                encodedClientDataJSON === null
              }
            >
              Continue
            </Button>
            <p>{formState.message}</p>
          </div>
        </div>

        <p>{formState.message}</p>
      </form>
    </AuthCard>
  )
}
