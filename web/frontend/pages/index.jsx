//@ts-check
import React from 'react'
import {
  LegacyCard,
  Page,
  Layout,
  Image,
  LegacyStack as Stack,
  VerticalStack,
  Link,
  Text,
  Button,
} from '@shopify/polaris'
import { TitleBar, useNavigate } from '@shopify/app-bridge-react'
import { ProductsCard } from '../components'
import { useAuthenticatedFetch } from '../hooks'

export default function HomePage() {
  return (
    <Page narrowWidth>
      <TitleBar title="Custom Reports" primaryAction={undefined} />
      <Layout>
        <Layout.Section>
          <GoogleAuthCard />
        </Layout.Section>

        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  )
}

function GoogleAuthCard() {
  const navigate = useNavigate()
  return (
    <LegacyCard sectioned>
      <Stack
        wrap={false}
        spacing="extraTight"
        distribution="trailing"
        alignment="center"
      >
        <Stack.Item fill>
          <Button
            primary
            onClick={() => {
              const redirectUri = `/api/redirect?to=google&state=${window._APP_CONSTS.shopify_state}`
              console.log('click : ', redirectUri)
              navigate(
                '/exit-iframe?redirectUri=' + encodeURIComponent(redirectUri),
              )
            }}
          >
            Login
          </Button>

          <div>
            <a
              href={`/api/redirect?to=google&state=${window._APP_CONSTS.shopify_state}`}
              target="_blank"
            >
              google
            </a>
          </div>
          <VerticalStack gap="4"></VerticalStack>
        </Stack.Item>
      </Stack>
    </LegacyCard>
  )
}
