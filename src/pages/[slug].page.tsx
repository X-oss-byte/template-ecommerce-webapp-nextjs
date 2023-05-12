import { Box } from '@chakra-ui/react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useProductPage } from '@src/_ctf-private';
import { ProductDetails, ProductTileGrid } from '@src/components/features/product';
import { SeoFields } from '@src/components/features/seo';
import { client } from '@src/lib/client';
import { getServerSideTranslations } from '@src/pages/utils/get-serverside-translations';

const Page = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const { locale } = useRouter();

  /**
   * TODO: this is a main-private feature, and should be removed from the main branch during the split
   */
  const { data } = useProductPage({
    slug: props.product.slug,
    initialData: props.product,
  });

  const product = useContentfulLiveUpdates(data, locale || '');

  if (!product) return null;

  return (
    <>
      {product.seoFields && <SeoFields {...product.seoFields} />}
      <ProductDetails {...product} />
      {product.relatedProductsCollection?.items && (
        <Box
          mt={{
            base: 5,
            md: 9,
            lg: 16,
          }}>
          <ProductTileGrid
            title={t('product.relatedProducts')}
            products={product.relatedProductsCollection.items}
          />
        </Box>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  if (!params?.slug || !locale) {
    return {
      notFound: true,
    };
  }

  try {
    const data = await client.pageProduct({ slug: params.slug.toString(), locale });
    const product = data.pageProductCollection?.items[0];

    if (!product) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        ...(await getServerSideTranslations(locale)),
        product,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};

export default Page;
