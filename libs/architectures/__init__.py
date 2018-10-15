from libs.architectures import dense, conv1, conv2, resnet

def build_generator(architecture, latent_dim, img_shape):
	if (architecture == 'dense'):
		return dense.generator(latent_dim, img_shape)
	if (architecture == 'conv1'):
		return conv1.generator(latent_dim, img_shape)
	if (architecture == 'conv2'):
		return conv2.generator(latent_dim, img_shape)
	if (architecture == 'resnet'):
		return resnet.generator(latent_dim, img_shape)

def build_discriminator(architecture, img_shape):
	if (architecture == 'dense'):
		return dense.discriminator(img_shape)
	if (architecture == 'conv1'):
		return conv1.discriminator(img_shape)
	if (architecture == 'conv2'):
		return conv2.discriminator(img_shape)
	if (architecture == 'resnet'):
		return resnet.discriminator(img_shape)
